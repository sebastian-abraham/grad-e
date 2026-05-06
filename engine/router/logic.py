import json
import os
import traceback
import time
from google.genai import types

# Import both engines
from engine.cloud.agents import MultiAgentGrader, extract_json
from engine.local.pipeline import LocalPipelineManager

class GradeRouter:
    def __init__(self):
        self.cloud_agent = MultiAgentGrader()
        self.local_engine = LocalPipelineManager()

    def setup_exam_context(self, exam_id, qp_path, ak_path):
        """Uses Gemini to instantly generate the JSON Question Schema."""
        print(f"🔀 [ROUTER] Routing Setup for {exam_id} to Primary Cloud Engine...")
        
        try:
            qp_file_obj = self.cloud_agent.upload_pdf(qp_path)
            
            setup_prompt = """You are an AI Data Structurer reading a university exam paper.
            Extract every single question and format it into a JSON array.
            RULES:
            1. Identify Question ID.
            2. Transcribe core text.
            3. Identify maximum marks.
            4. Output STRICTLY as a JSON array of objects.
            """

            response = self.cloud_agent.safe_generate(
                contents=[qp_file_obj, "Extract the questions into the JSON array."],
                config=types.GenerateContentConfig(
                    system_instruction=setup_prompt,
                    response_mime_type="application/json"
                ),
                use_vision=False 
            )
            
            questions_list = extract_json(response.text)

            if questions_list:
                normalized_list = []
                for q in questions_list:
                    normalized_list.append({
                        "id": str(q.get("id", q.get("question_id", ""))),
                        "context": q.get("context", q.get("question_text", "")),
                        "max_points": float(q.get("max_points", q.get("maximum_marks", 0)))
                    })
                questions_list = normalized_list
                schema_path = f"engine/storage/inputs/{exam_id}/exam_metadata.json"
                with open(schema_path, "w") as f:
                    json.dump({"exam_id": exam_id, "questions": questions_list}, f, indent=4)
                    
                print(f"✅ [ROUTER] Cloud Setup complete. Extracted {len(questions_list)} questions.")
                return {"status": "success", "count": len(questions_list)}
            else:
                return {"status": "error"}

        except Exception as e:
            print(f"❌ [ROUTER ERROR] Cloud Setup Failed: {e}")
            return {"status": "error"}

    def route_and_grade(self, exam_id, student_file_paths, mode="auto"):
        print(f"\n🔀 [ROUTER] Initiating Grading for {exam_id} in {mode.upper()} mode...")
        
        schema_path = f"engine/storage/inputs/{exam_id}/exam_metadata.json"
        qp_path = f"engine/storage/inputs/{exam_id}/question_paper.pdf"
        reports_dir = f"engine/storage/reports/{exam_id}"
        os.makedirs(reports_dir, exist_ok=True)
        
        if not os.path.exists(schema_path):
            print(f"❌ [ROUTER ERROR] No setup schema found for {exam_id}.")
            return
            
        with open(schema_path, "r") as f:
            metadata = json.load(f)
        questions_list = metadata["questions"]

        # Configure Local Pipeline directories just in case it's needed
        self.local_engine.inputs_dir = f"engine/storage/inputs/{exam_id}"
        self.local_engine.crops_dir = f"engine/storage/crops/{exam_id}"
        self.local_engine.reports_dir = reports_dir
        os.makedirs(f"{self.local_engine.crops_dir}/golden", exist_ok=True)
        os.makedirs(f"{self.local_engine.crops_dir}/students", exist_ok=True)

        # ==========================================
        # OVERRIDE 1: STRICT LOCAL MODE
        # ==========================================
        if mode == "local":
            print(f"💻 [ROUTER] Explicit LOCAL override active. Handing batch to RTX 5060...")
            self.local_engine.run_pipeline(questions_list, student_file_paths)
            print("\n✅ [ROUTER] Local Batch processing complete.")
            return

        # ==========================================
        # OVERRIDE 2: STRICT CLOUD MODE
        # ==========================================
        elif mode == "cloud":
            print(f"☁️ [ROUTER] Explicit CLOUD override active. No local failover.")
            for student_path in student_file_paths:
                student_id = os.path.basename(student_path).replace('.pdf', '')
                report_path = f"{reports_dir}/{student_id}_report.json"
                
                print(f"☁️ [ROUTER] Routing {student_id} to Cloud Engine...")
                try:
                    final_report = self.cloud_agent.run_agent_workflow(student_path, qp_path)
                    if "error" in final_report:
                        raise Exception(final_report["error"])
                    with open(report_path, "w") as f:
                        json.dump(final_report, f, indent=4)
                    print(f"✅ [CLOUD] Successfully graded {student_id}")
                except Exception as e:
                    print(f"❌ [CLOUD ERROR] Failed on {student_id}: {e}")
            print("\n✅ [ROUTER] Cloud Batch processing complete.")
            return

        # ==========================================
        # DEFAULT: AUTO FAILOVER MODE
        # ==========================================
        else:
            print(f"🔄 [ROUTER] AUTO mode engaged. Cloud primary with Local failover.")
            cooldown_until = 0  
            COOLDOWN_SECONDS = 60  

            for student_path in student_file_paths:
                student_id = os.path.basename(student_path).replace('.pdf', '')
                report_path = f"{reports_dir}/{student_id}_report.json"
                
                # --- CHECK COOLDOWN TIMER ---
                current_time = time.time()
                if current_time < cooldown_until:
                    remaining_time = int(cooldown_until - current_time)
                    print(f"💻 [ROUTER] Cloud is in cooldown ({remaining_time}s left). Routing {student_id} to Local Edge...")
                    self.local_engine.run_pipeline(questions_list, [student_path])
                    continue

                # --- PRIMARY CLOUD ROUTE ---
                print(f"☁️ [ROUTER] Routing {student_id} to Cloud Engine...")
                try:
                    final_report = self.cloud_agent.run_agent_workflow(student_path, qp_path)
                    if "error" in final_report:
                        raise Exception(final_report["error"])
                    
                    with open(report_path, "w") as f:
                        json.dump(final_report, f, indent=4)
                    print(f"✅ [CLOUD] Successfully graded {student_id}")

                except Exception as e:
                    err_str = str(e).upper()
                    print(f"\n⚠️ [ROUTER] Cloud Error on {student_id}: {err_str}")
                    print(f"⚠️ [CIRCUIT BREAKER] Tripping Cloud Cooldown for {COOLDOWN_SECONDS} seconds...")
                    
                    # Activate Cooldown
                    cooldown_until = time.time() + COOLDOWN_SECONDS
                    
                    # Grade the failed student locally
                    print(f"💻 [ROUTER] Shifting {student_id} to Local Edge...")
                    self.local_engine.run_pipeline(questions_list, [student_path])

            print("\n✅ [ROUTER] Auto Batch processing complete.")