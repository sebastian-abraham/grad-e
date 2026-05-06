import os
import glob
import json
import uuid
from .indexer import LocalColPaliIndexer
from .vlm_grader import LocalOllamaGrader 

class LocalPipelineManager:
    def __init__(self):
        self.inputs_dir = "engine/storage/local/inputs"
        self.crops_dir = "engine/storage/local/crops"
        self.reports_dir = "engine/storage/local/reports"

    def run_pipeline(self, questions_list, student_pdfs=None):
        run_id = uuid.uuid4().hex[:6]  # Generates unique ID to prevent Byaldi crashes

        os.makedirs(f"{self.crops_dir}/golden", exist_ok=True)
        os.makedirs(f"{self.crops_dir}/students", exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)

        # ==========================================
        # PHASE 1: BATCH EXTRACTION (COLPALI)
        # ==========================================
        print("\n🚀 [PHASE 1] Starting Batch Extraction Pipeline...")
        indexer = LocalColPaliIndexer(storage_dir=self.crops_dir)
        indexer.load_model() 

        print("--> Processing Golden Standard...")
        qp_path = f"{self.inputs_dir}/question_paper.pdf"
        idx_qp_name = f"idx_qp_{run_id}"
        indexer.create_index(qp_path, idx_qp_name)
        
        ak_path = f"{self.inputs_dir}/answer_key.pdf"
        idx_key_name = f"idx_key_{run_id}"
        if os.path.exists(ak_path):
            indexer.unload_model()
            del indexer
            indexer = LocalColPaliIndexer(storage_dir=self.crops_dir)
            indexer.load_model()
            indexer.create_index(ak_path, idx_key_name)

        for q in questions_list:
            q_id = str(q.get("id", q.get("question_id", "")))
            q_text = q.get("context", q.get("question_text", ""))
            
            indexer.extract_crop(idx_qp_name, q_text, f"golden/q_{q_id}_question", k=1)
            if os.path.exists(ak_path):
                indexer.extract_crop(idx_key_name, f"Solution for {q_text}", f"golden/q_{q_id}_key", k=1)

        if not student_pdfs:
            student_pdfs = glob.glob(f"{self.inputs_dir}/students/*.pdf")
        
        print(f"--> Processing {len(student_pdfs)} student scripts...")
        for pdf_path in student_pdfs:
            print("🔄 Cycling VRAM for fresh index...")
            indexer.unload_model()
            del indexer
            indexer = LocalColPaliIndexer(storage_dir=self.crops_dir)
            indexer.load_model()
            
            student_id = os.path.basename(pdf_path).replace('.pdf', '')
            idx_student_name = f"idx_{student_id}_{run_id}"
            
            indexer.create_index(pdf_path, idx_student_name)
            
            for q in questions_list:
                q_id = str(q.get("id", q.get("question_id", "")))
                q_text = q.get("context", q.get("question_text", ""))
                search_query = f"Student's handwritten answer for Question {q_id}: {q_text}"
                indexer.extract_crop(idx_student_name, search_query, f"students/{student_id}_q_{q_id}", k=2)

        indexer.unload_model()
        print("✅ [PHASE 1 COMPLETE] ColPali unloaded. VRAM cleared.")

        # ==========================================
        # PHASE 2: BATCH GRADING (QWEN / LLAMA)
        # ==========================================
        print("\n🚀 [PHASE 2] Starting Batch Grading Pipeline...")
        grader = LocalOllamaGrader() 

        for pdf_path in student_pdfs:
            student_id = os.path.basename(pdf_path).replace('.pdf', '')
            
            # FIXED: Initialized with "questions" to match Cloud parity
            student_report = {"student_id": student_id, "score": 0, "total": 0, "questions": []}

            for q in questions_list:
                q_id = str(q.get("id", q.get("question_id", "")))
                max_pts = float(q.get("max_points", q.get("maximum_marks", 0)))
                
                student_report["total"] += max_pts
                
                q_img = f"{self.crops_dir}/golden/q_{q_id}_question_part1.png"
                k_img = f"{self.crops_dir}/golden/q_{q_id}_key_part1.png"
                s_imgs = sorted(glob.glob(f"{self.crops_dir}/students/{student_id}_q_{q_id}_part*.png"))

                if s_imgs:
                    actual_key = k_img if os.path.exists(k_img) else None
                    
                    if not actual_key:
                        print(f"⚠️ No answer key found for Q{q_id}. Initiating Zero-Shot Autonomous Grading...")
                        
                    grade_data = grader.evaluate_answer(q, q_img, actual_key, s_imgs)
                    
                    if grade_data:
                        # FIXED: Appending to "questions" and grabbing "points"
                        student_report["questions"].append(grade_data)
                        student_report["score"] += grade_data.get("points", 0)

            # FIXED: Added the final formatting math to perfectly match Cloud engine
            student_report["score"] = round(student_report["score"] * 2) / 2
            student_report["points"] = f"{student_report['score']}/{student_report['total']}"
            student_report["score"] = min(student_report["score"], student_report["total"])

            report_path = f"{self.reports_dir}/{student_id}_report.json"
            with open(report_path, "w") as f:
                json.dump(student_report, f, indent=4)
            print(f"💾 Saved report to {report_path}")