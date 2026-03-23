# engine/cloud/agent.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from .prompts import (
    LAYOUT_MANAGER_PROMPT, 
    TEXT_AGENT_PROMPT, 
    MATH_AGENT_PROMPT, 
    DIAGRAM_AGENT_PROMPT
)

load_dotenv()

class MultiAgentGrader:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found.")
        genai.configure(api_key=api_key)
        

        self.manager_model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=LAYOUT_MANAGER_PROMPT)
        self.text_model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=TEXT_AGENT_PROMPT)
        self.math_model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=MATH_AGENT_PROMPT)
        self.diagram_model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=DIAGRAM_AGENT_PROMPT)

    def upload_pdf(self, pdf_path):
        print(f"[SYSTEM] Uploading {pdf_path} to Gemini...")
        return genai.upload_file(path=pdf_path)

    def run_agent_workflow(self, pdf_path, answer_key):
        """
        The Orchestrator Function:
        1. Manager scans PDF -> Returns Task List.
        2. Loop through Tasks -> Dispatch to Specialist.
        3. Aggregate Results.
        """
        try:

            pdf_file = self.upload_pdf(pdf_path)
            

            print("[MANAGER AGENT] Analyzing Document Structure...")
            response = self.manager_model.generate_content([pdf_file, "Analyze this answer script."])
            

            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            task_list = json.loads(clean_json)
            print(f"[MANAGER AGENT] Found {len(task_list)} questions.")


            final_report = {"student_id": "Unknown", "results": []}
            
            for task in task_list:
                q_no = task.get("q_no")
                q_type = task.get("type")
                print(f"   --> Dispatching {q_no} ({q_type}) to {q_type.upper()} AGENT...")
                

                result = None
                input_prompt = f"Grade Question {q_no}. Answer Key Context: {answer_key}"
                
                if q_type == "text":
                    res = self.text_model.generate_content([pdf_file, input_prompt])
                    result = res.text
                elif q_type == "math":
                    res = self.math_model.generate_content([pdf_file, input_prompt])
                    result = res.text
                elif q_type == "diagram":
                    res = self.diagram_model.generate_content([pdf_file, input_prompt])
                    result = res.text
                

                try:
                    score_data = json.loads(result.replace("```json", "").replace("```", "").strip())
                except:
                    score_data = {"score": 0, "feedback": "Agent Error", "raw": result}
                
                final_report["results"].append({
                    "question": q_no,
                    "type": q_type,
                    "grading": score_data
                })

            return final_report

        except Exception as e:
            print(f"[ERROR] Workflow Failed: {e}")
            return {"error": str(e)}