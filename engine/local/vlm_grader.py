import ollama
import json
import os
from PIL import Image

from .prompts import LOCAL_MANAGER_PROMPT, LOCAL_TEXT_PROMPT, LOCAL_MATH_PROMPT, LOCAL_DIAGRAM_PROMPT

class LocalOllamaGrader:
    def __init__(self):
        self.model_name = "qwen3-vl:4b"

    def _compress_for_vram(self, img_paths):
        compressed_paths = []
        for img_path in img_paths:
            if img_path and os.path.exists(img_path):
                try:
                    with Image.open(img_path) as img:
                        # Downscale to 720p max. Drastically cuts token count!
                        img.thumbnail((1280, 720))
                        # Overwrite the original crop with a highly optimized version
                        img.save(img_path, optimize=True, quality=75)
                        compressed_paths.append(img_path)
                except Exception as e:
                    print(f"⚠️ Image compression failed for {img_path}: {e}")
                    compressed_paths.append(img_path) # Fallback to original if error
        return compressed_paths

    def _extract_json(self, text):
        try:
            clean_json = text[text.find("{"):text.rfind("}")+1]
            return json.loads(clean_json)
        except (json.JSONDecodeError, ValueError):
            return None

    def evaluate_answer(self, q_data, q_img_path, key_img_path, student_img_paths):
        # 1. SAFE GETTERS & ZERO-POINT OVERRIDE
        q_id = str(q_data.get("id", q_data.get("question_id", "")))
        max_pts = float(q_data.get("max_points", q_data.get("maximum_marks", 10.0)))
        q_text = q_data.get("context", q_data.get("question_text", "Solve this question."))

        if max_pts == 0.0:
            max_pts = 10.0  # Hard override to prevent math errors!

        # 2. IMAGE COMPRESSION (Prevents 8B VRAM overflow)
        print("🗜️ Compressing images to prevent VRAM overflow...")
        q_img_path = self._compress_for_vram([q_img_path])[0] if q_img_path else None
        key_img_path = self._compress_for_vram([key_img_path])[0] if key_img_path else None
        student_img_paths = self._compress_for_vram(student_img_paths)

        # ==========================================
        # MODE A: COMPARATIVE GRADING (KEY EXISTS)
        # ==========================================
        if key_img_path is not None:
            print(f"\n👔 [MANAGER] Analyzing Q{q_id} (Max Points: {max_pts}) via Ollama...")

            manager_messages = [
                {"role": "system", "content": LOCAL_MANAGER_PROMPT},
                {
                    "role": "user", 
                    "content": f"Image 1 is the Question. Image 2 is the Answer Key. Allocate the {max_pts} points to the required agents (text, math, diagram).",
                    "images": [q_img_path, key_img_path] 
                }
            ]
            
            manager_response = ollama.chat(
                model=self.model_name, 
                messages=manager_messages,
                format="json", 
                keep_alive="2m",
                options={"num_ctx": 4096} # CRITICAL: Caps the memory allocation!
            )
            
            routing_plan = self._extract_json(manager_response['message']['content'])

            if not routing_plan or "agents" not in routing_plan:
                print("⚠️ [MANAGER ERROR] Defaulting to Math Agent.")
                routing_plan = {"agents": [{"type": "math", "points": max_pts}]}

            # 3. INITIALIZE SAFE VARIABLES (This fixes the NameError!)
            final_score = 0.0
            combined_feedback = []
            final_correct_answer = "Could not generate."
            final_student_answer = "Could not generate."

            prompt_map = {
                "text": LOCAL_TEXT_PROMPT,
                "math": LOCAL_MATH_PROMPT,
                "diagram": LOCAL_DIAGRAM_PROMPT
            }

            total_agents = len(routing_plan["agents"])
            
            for idx, task in enumerate(routing_plan["agents"]):
                agent_type = task["type"]
                allocated_pts = task["points"]
                
                print(f"  --> 🕵️‍♂️ [{agent_type.upper()} AGENT] Evaluating student crop(s) for {allocated_pts} points...")
                
                specialist_messages = [
                    {"role": "system", "content": prompt_map.get(agent_type, LOCAL_TEXT_PROMPT)},
                    {
                        "role": "user", 
                        "content": f"Image 1 is the Reference Key. All subsequent images are the Student's Answer. Grade the {agent_type} aspects out of {allocated_pts} points.",
                        "images": [key_img_path] + student_img_paths
                    }
                ]
                
                keep_model_alive = "2m" if idx < (total_agents - 1) else 0

                try:
                    agent_response = ollama.chat(
                        model=self.model_name, 
                        messages=specialist_messages,
                        format="json",
                        keep_alive=keep_model_alive,
                        options={"num_ctx": 4096} # CRITICAL: Caps the memory allocation!
                    )
                    
                    agent_data = self._extract_json(agent_response['message']['content'])
                    
                    if agent_data:
                        final_score += float(agent_data.get("points", 0))
                        combined_feedback.append(f"[{agent_type.upper()}]: {agent_data.get('feedback', 'No feedback provided.')}")
                        final_correct_answer = str(agent_data.get("correctAnswer", final_correct_answer))
                        final_student_answer = str(agent_data.get("studentAnswer", final_student_answer))
                    else:
                        print(f"  ⚠️ [{agent_type.upper()} ERROR] Failed to parse JSON output.")
                        
                except Exception as e:
                    print(f"  ❌ [{agent_type.upper()} FATAL] {e}")

            # 4. SAFE RETURN
            return {
                "id": q_id,  
                "points": min(final_score, max_pts),  
                "status": "correct" if final_score >= (max_pts * 0.9) else "partial",
                "feedback": " | ".join(combined_feedback) if combined_feedback else "Agent failed to provide valid JSON feedback.",
                "correctAnswer": final_correct_answer, 
                "studentAnswer": final_student_answer  
            }

        # ==========================================
        # MODE B: ZERO-SHOT AUTONOMOUS (NO KEY)
        # ==========================================
        else:
            print(f"\n🧠 [AUTONOMOUS MODE] Deriving answer for Q{q_id} from scratch...")
            
            system_prompt = f"""You are an expert university professor grading an exam. 
            No official answer key is provided. You must use your own expert knowledge to solve the following question from scratch, then grade the student's handwritten answer based on your derivation.
            The question is: '{q_text}'
            Maximum points: {max_pts}.
            Carefully check the student's methodology and calculations. 
            Return ONLY a valid JSON object with keys: 'points' (float), 'status' (string: correct/partial/incorrect), 'studentAnswer' (string), 'correctAnswer' (string), and 'feedback' (string)."""
            
            autonomous_messages = [
                {"role": "user", "content": system_prompt, "images": [q_img_path] + student_img_paths}
            ]
            
            try:
                agent_response = ollama.chat(
                    model=self.model_name, 
                    messages=autonomous_messages,
                    format="json",
                    keep_alive=0,
                    options={"num_ctx": 4096} # CRITICAL: Caps the memory allocation!
                )
                
                agent_data = self._extract_json(agent_response['message']['content'])
                
                if agent_data:
                    score = float(agent_data.get("points", 0))
                    return {
                        "id": q_id,
                        "points": min(score, max_pts),
                        "status": "correct" if score >= (max_pts * 0.9) else "partial",
                        "feedback": f"[AUTONOMOUS]: {agent_data.get('feedback', '')}",
                        "correctAnswer": str(agent_data.get("correctAnswer", "")),
                        "studentAnswer": str(agent_data.get("studentAnswer", ""))
                    }
                else:
                     print(f"❌ Autonomous Grader Error on Q{q_id}: Failed to parse JSON.")
            except Exception as e:
                print(f"❌ Autonomous Grader Error on Q{q_id}: {e}")
                
            return {
                "id": q_id,
                "points": 0.0,
                "status": "incorrect",
                "feedback": "Agent crashed during evaluation.",
                "correctAnswer": "",
                "studentAnswer": ""
            }