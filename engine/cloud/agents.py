import os
import time
import google.genai as genai
import json
import re
from google.genai import types
from .prompts import (
    LAYOUT_MANAGER_PROMPT, 
    TEXT_AGENT_PROMPT, 
    MATH_AGENT_PROMPT, 
    DIAGRAM_AGENT_PROMPT
)

def extract_json(text):
    try:
        start = text.find('{')
        end = text.rfind('}')
        start_list = text.find('[')
        end_list = text.rfind(']')
        if start_list != -1 and (start == -1 or start_list < start):
            start = start_list
            end = end_list
        if start != -1 and end != -1:
            json_str = text[start:end + 1]
            return json.loads(json_str)
        return None
    except json.JSONDecodeError:
        return None

class MultiAgentGrader:
    def __init__(self):
        raw_keys = os.getenv("GEMINI_KEYS", "")
        self.api_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        
        if len(self.api_keys) < 1:
            raise ValueError("Error: No keys found in GEMINI_KEYS inside your .env file.")
        
        self.current_key_index = 0
        self.client = genai.Client(api_key=self.api_keys[self.current_key_index])
        self.model_name = "gemini-2.5-flash"
        
        # Track local paths and active API file objects for re-syncing
        self.active_file_paths = []
        self.active_file_objects = []

    def _rotate_key(self):
        """Switches to the next API key and prepares for file re-sync."""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        new_key = self.api_keys[self.current_key_index]
        print(f"[SYSTEM] Rotating to Key #{self.current_key_index + 1} of {len(self.api_keys)}...")
        self.client = genai.Client(api_key=new_key)
        
        # Invalidate old project's file objects
        self.active_file_objects = []

    def sync_files(self):
        """Ensures the current API project has the necessary files uploaded."""
        if not self.active_file_objects and self.active_file_paths:
            print("[SYSTEM] Re-uploading files to new project context...")
            self.active_file_objects = [self.upload_pdf(fp) for fp in self.active_file_paths]
            time.sleep(5)
        return self.active_file_objects

    def safe_generate(self, contents, config, use_vision=False, retries=None):
        """Handles 429/403 errors with automatic rotation and file re-sync."""
        if retries is None:
            retries = len(self.api_keys) * 2

        for attempt in range(retries):
            try:
                current_contents = contents
                # If vision is needed, ensure files are synced to the CURRENT key
                if use_vision:
                    synced_files = self.sync_files()
                    # Filter out any stale file objects from contents and prepend new ones
                    clean_contents = [c for c in contents if not hasattr(c, 'name')]
                    current_contents = synced_files + clean_contents

                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=current_contents,
                    config=config
                )
            except Exception as e:
                err_str = str(e).upper()
                if any(x in err_str for x in ["429", "RESOURCE_EXHAUSTED", "403", "PERMISSION_DENIED"]):
                    self._rotate_key()
                    time.sleep(2)
                else:
                    raise e
        raise Exception("[FATAL] All keys exhausted or persistent permission errors.")

    def upload_pdf(self, pdf_path):
        print(f"[SYSTEM] Uploading {os.path.basename(pdf_path)} to Gemini...")
        return self.client.files.upload(file=pdf_path)

    def run_agent_workflow(self, script_path, question_paper_path=None):
        try:
            # 1. Automatically infer where the answer key SHOULD be
            exam_dir = os.path.dirname(question_paper_path) if question_paper_path else os.path.dirname(os.path.dirname(script_path))
            answer_key_path = os.path.join(exam_dir, "answer_key.pdf")

            # 2. Dynamic Context Setup
            self.active_file_paths = []
            if question_paper_path and question_paper_path != script_path:
                self.active_file_paths.append(question_paper_path)
            
            # Check if the key actually exists on the hard drive
            has_key = False
            if os.path.exists(answer_key_path):
                self.active_file_paths.append(answer_key_path)
                has_key = True
            
            self.active_file_paths.append(script_path)
            
            # Perform initial upload for Key #1
            self.active_file_objects = [self.upload_pdf(fp) for fp in self.active_file_paths]
            time.sleep(5) 

            # Manager Logic
            print("[MANAGER] Digitizing handwriting and routing tasks...")
            manager_instr = "Analyze structure and extract student's handwritten answers to 'extracted_text' field."
            
            response = self.safe_generate(
                contents=[manager_instr], 
                config=types.GenerateContentConfig(
                    system_instruction=LAYOUT_MANAGER_PROMPT,
                    response_mime_type="application/json"
                ),
                use_vision=True
            )
            
            manager_data = extract_json(response.text)
            task_list = manager_data.get("questions", [])
            print(f"[MANAGER] Found {len(task_list)} tasks. Launching Hybrid Graders...")

            final_report = {
                "student_id": os.path.basename(script_path).replace('.pdf', ''),
                "score": 0, 
                "total": 0, 
                "questions": []
            }
            # Hybrid Specialist Loop
            for task in task_list:
                q_id = task.get("id", "Unknown")
                q_type = task.get("type", "text")
                max_pts = task.get("max_points", 5)
                student_work = task.get("extracted_text", "No text extracted")

                # ==========================================
                # FALLBACK LOGIC INJECTION
                # ==========================================
                if has_key:
                    mode_instruction = "\n[MODE: COMPARATIVE GRADING] An official Answer Key is attached. Evaluate the student's answer strictly against the methodology and final answer in the Answer Key."
                    status_print = f"   --> {q_id}: {q_type.capitalize()} Reasoning (using Answer Key)..."
                else:
                    mode_instruction = "\n[MODE: ZERO-SHOT AUTONOMOUS GRADING] No Answer Key is provided. You MUST derive the correct solution from scratch using your expert knowledge, then evaluate the student's logic against your own derivation."
                    status_print = f"   ☁️ [CLOUD] No key found for Q{q_id}. Deriving {q_type} from scratch..."

                print(status_print)

                specialist_input = f"Question: {task.get('context')}\nStudent: {student_work}\nMax: {max_pts}{mode_instruction}"
                
                # We force use_vision=True for ALL tasks now. 
                # Why? Because if there is an Answer Key, Gemini needs vision to read it. 
                # If there is NO Answer Key, Gemini needs vision to derive math from the original Question Paper PDF.
                is_vision_task = True 
                
                if q_type == "diagram":
                    sys_inst = DIAGRAM_AGENT_PROMPT
                elif q_type == "math":
                    sys_inst = MATH_AGENT_PROMPT 
                else:
                    sys_inst = TEXT_AGENT_PROMPT

                time.sleep(4) 
                
                res = self.safe_generate(
                    contents=[specialist_input], 
                    config=types.GenerateContentConfig(
                        system_instruction=sys_inst,
                        response_mime_type="application/json"
                    ),
                    use_vision=is_vision_task
                )

                score_data = extract_json(res.text)
                if score_data:
                    earned = score_data.get("points", 0)
                    final_report["score"] += earned
                    final_report["total"] += max_pts
                    final_report["questions"].append({
                        "id": q_id,
                        "points": earned,
                        "status": "correct" if (earned/max_pts) >= 0.9 else "partial",
                        "feedback": score_data.get("feedback"),
                        "correctAnswer": score_data.get("correctAnswer"),
                        "studentAnswer": student_work
                    })

            final_report["score"] = round(final_report["score"] * 2) / 2
            final_report["points"] = f"{final_report['score']}/{final_report['total']}"
            final_report["score"] = min(final_report["score"], final_report["total"])
            
            return final_report

        except Exception as e:
            print(f"[ERROR] Workflow Failed: {e}")
            return {"error": str(e)}