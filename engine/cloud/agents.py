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
        # Initialize your pool of 7-8 keys
        raw_keys = os.getenv("GEMINI_KEYS", "")
        self.api_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        
        if len(self.api_keys) < 1:
            raise ValueError("❌ Error: No keys found in GEMINI_KEYS inside your .env file.")
        
        self.current_key_index = 0
        self.client = genai.Client(api_key=self.api_keys[self.current_key_index])
        self.model_name = "gemini-2.5-flash" # High stability for multi-agent loops

    def _rotate_key(self):
        """Switches to the next API key in the pool to reset the RPD/TPM quota."""
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        new_key = self.api_keys[self.current_key_index]
        print(f"🔄 [SYSTEM] Quota hit. Rotating to Key #{self.current_key_index + 1} of {len(self.api_keys)}...")
        self.client = genai.Client(api_key=new_key)

    def safe_generate(self, contents, config, retries=None):
        """Standard wrapper to handle 429 and Resource Exhausted errors automatically."""
        if retries is None:
            retries = len(self.api_keys) * 2

        for attempt in range(retries):
            try:
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                err_str = str(e).upper()
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    self._rotate_key()
                    time.sleep(2) 
                else:
                    raise e
        raise Exception("❌ [FATAL] Every single key in your pool is exhausted.")

    def upload_pdf(self, pdf_path):
        print(f"[SYSTEM] Uploading {pdf_path} to Gemini...")
        return self.client.files.upload(file=pdf_path)

    def run_agent_workflow(self, script_path, question_paper_path=None):
        try:
            # Step 1: Context Setup
            script_file = self.upload_pdf(script_path)
            time.sleep(5) 
            
            context_files = [script_file]
            if question_paper_path and question_paper_path != script_path:
                qp_file = self.upload_pdf(question_paper_path)
                context_files.insert(0, qp_file)

            # Step 2: Manager OCR and Structure Mapping
            print("[MANAGER] Digitizing handwriting and routing tasks...")
            manager_instr = "Analyze structure and extract student's handwritten answers to 'extracted_text' field."
            
            response = self.safe_generate(
                contents=context_files + [manager_instr],
                config=types.GenerateContentConfig(
                    system_instruction=LAYOUT_MANAGER_PROMPT,
                    response_mime_type="application/json"
                )
            )
            
            manager_data = extract_json(response.text)
            task_list = manager_data.get("questions", [])
            print(f"[MANAGER] Found {len(task_list)} tasks. Launching Hybrid Graders...")

            final_report = {
                "examTitle": manager_data.get("examTitle", "Unknown Exam"),
                "studentName": manager_data.get("studentName", "Unknown Student"),
                "score": 0, "total": 0, "questions": []
            }
            
            # Step 3: Hybrid Specialist Loop
            for task in task_list:
                q_id = task.get("id", "Unknown")
                q_type = task.get("type", "text")
                max_pts = task.get("max_points", 5)
                student_work = task.get("extracted_text", "No text extracted")

                # HYBRID VISION TRIGGER: Only send PDF for diagrams
                specialist_input = f"Question: {task.get('context')}\nStudent: {student_work}\nMax: {max_pts}"
                
                if q_type == "diagram":
                    print(f"   --> {q_id}: Vision-based Grading...")
                    # Diagram agent receives actual PDF pages
                    specialist_contents = context_files + [specialist_input]
                    sys_inst = DIAGRAM_AGENT_PROMPT
                else:
                    print(f"   --> {q_id}: Text-based Reasoning...")
                    # Math/Text agents receive only transcribed text
                    specialist_contents = [specialist_input]
                    sys_inst = MATH_AGENT_PROMPT if q_type == "math" else TEXT_AGENT_PROMPT

                time.sleep(4) # Maintain 15 RPM limit safely
                
                res = self.safe_generate(
                    contents=specialist_contents, 
                    config=types.GenerateContentConfig(
                        system_instruction=sys_inst,
                        response_mime_type="application/json"
                    )
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

            final_report["points"] = f"{final_report['score']}/{final_report['total']}"
            return final_report

        except Exception as e:
            print(f"[ERROR] Workflow Failed: {e}")
            return {"error": str(e)}