import ollama
import json

from .prompts import LOCAL_MANAGER_PROMPT, LOCAL_TEXT_PROMPT, LOCAL_MATH_PROMPT, LOCAL_DIAGRAM_PROMPT

class LocalOllamaGrader:
    def __init__(self):
        self.model_name = "qwen3-vl:8b" 

    def _extract_json(self, text):
        try:
            clean_json = text[text.find("{"):text.rfind("}")+1]
            return json.loads(clean_json)
        except (json.JSONDecodeError, ValueError):
            return None

    def evaluate_answer(self, q_data, q_img_path, key_img_path, student_img_paths):
        # 1. SAFE GETTERS 
        q_id = str(q_data.get("id", q_data.get("question_id", "")))
        max_pts = float(q_data.get("max_points", q_data.get("maximum_marks", 0)))
        q_text = q_data.get("context", q_data.get("question_text", ""))

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
                keep_alive="5m" 
            )
            
            routing_plan = self._extract_json(manager_response['message']['content'])

            if not routing_plan or "agents" not in routing_plan:
                print("⚠️ [MANAGER ERROR] Defaulting to Math Agent.")
                routing_plan = {"agents": [{"type": "math", "points": max_pts}]}

            final_score = 0.0
            combined_feedback = []

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
                
                keep_model_alive = "5m" if idx < (total_agents - 1) else 0

                agent_response = ollama.chat(
                    model=self.model_name, 
                    messages=specialist_messages,
                    format="json",
                    keep_alive=keep_model_alive 
                )
                
                agent_data = self._extract_json(agent_response['message']['content'])
                
                if agent_data:
                    # FIX 1: Extract 'points' instead of 'awarded_marks'
                    final_score += agent_data.get("points", 0)
                    combined_feedback.append(f"[{agent_type.upper()}]: {agent_data.get('feedback', '')}")

            return {
                "id": q_id,  
                "points": min(final_score, max_pts),  
                "status": "correct" if final_score >= (max_pts * 0.9) else "partial",
                "feedback": " | ".join(combined_feedback),
                "correctAnswer": agent_data.get("correctAnswer", ""), 
                "studentAnswer": agent_data.get("studentAnswer", "")  
            }

        # ==========================================
        # MODE B: ZERO-SHOT AUTONOMOUS (NO KEY)
        # ==========================================
        else:
            print(f"\n🧠 [AUTONOMOUS MODE] Deriving answer for Q{q_id} from scratch...")
            
            # FIX 2: Updated prompt to explicitly request the new JSON schema keys
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
                    keep_alive=0 
                )
                
                agent_data = self._extract_json(agent_response['message']['content'])
                
                if agent_data:
                    # FIX 3: Get 'points' instead of 'awarded_marks'
                    score = agent_data.get("points", 0)
                    
                    # FIX 4: Use 'score' and 'agent_data' instead of undefined variables
                    return {
                        "id": q_id,
                        "points": min(score, max_pts),
                        "status": "correct" if score >= (max_pts * 0.9) else "partial",
                        "feedback": f"[AUTONOMOUS]: {agent_data.get('feedback', '')}",
                        "correctAnswer": agent_data.get("correctAnswer", ""),
                        "studentAnswer": agent_data.get("studentAnswer", "")
                    }
            except Exception as e:
                print(f"❌ Autonomous Grader Error on Q{q_id}: {e}")
                
            return None