import asyncio
import os
import glob
import json
from pdf2image import convert_from_path # NEW IMPORT
from engine.local.pipeline import LocalPipelineManager
from engine.local.indexer import LocalColPaliIndexer
from engine.local.schema_gen import LocalSchemaGenerator

async def test_local_engine():
    print("🧪 Starting Local Engine Test...")
    
    exam_id = "exam_c0a05a7a"
    base_dir = f"engine/storage/inputs/{exam_id}"
    student_pdfs = glob.glob(f"{base_dir}/students/*.pdf")
    
    if not student_pdfs:
        print("❌ No student PDFs found in the students directory!")
        return

    crops_dir = f"engine/storage/crops/{exam_id}"
    os.makedirs(f"{crops_dir}/golden", exist_ok=True)
    os.makedirs(f"{crops_dir}/students", exist_ok=True)

    # ==========================================
    # PHASE 0: DYNAMIC SCHEMA GENERATION
    # ==========================================
    metadata_path = f"{base_dir}/exam_metadata.json"
    
    print("\n🚀 [PHASE 0] Extracting Points & Schema from FULL Question Paper...")
    schema_agent = LocalSchemaGenerator()
    qp_path = f"{base_dir}/question_paper.pdf"
    
    print("📸 Converting Question Paper to images for full analysis...")
    qp_pages = convert_from_path(qp_path, dpi=150)
    qp_img_paths = []
    
    for i, page in enumerate(qp_pages):
        path = f"{crops_dir}/golden/schema_qp_page_{i}.png"
        page.save(path, "PNG")
        qp_img_paths.append(path)
        
    exam_data = schema_agent.generate_schema(qp_img_paths, metadata_path)
    
    if not exam_data:
         print("❌ Failed to build schema. Aborting.")
         return

    questions_list = exam_data["questions"]

    # ==========================================
    # PHASE 1 & 2: BATCH EXTRACTION & GRADING
    # ==========================================
    local_pipeline = LocalPipelineManager()
    local_pipeline.inputs_dir = base_dir
    local_pipeline.crops_dir = crops_dir
    local_pipeline.reports_dir = f"engine/storage/reports/{exam_id}"
    
    os.makedirs(local_pipeline.reports_dir, exist_ok=True)

    print(f"--> Found {len(student_pdfs)} student scripts. Booting Pipeline...")
    local_pipeline.run_pipeline(questions_list, student_pdfs)
    
    print(f"✅ Test Complete! Check engine/storage/reports/{exam_id}/ for output JSONs.")

if __name__ == "__main__":
    asyncio.run(test_local_engine())