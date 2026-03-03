# demo_run.py
import os
import json
from dotenv import load_dotenv
from engine.cloud.agents import MultiAgentGrader

# 1. Setup Environment
load_dotenv()
os.makedirs("engine/storage/reports", exist_ok=True)

def run_standalone_demo():
    print("🚀 --- GRAD-E: Autonomous Multi-Agent Demo --- 🚀")
    print("Mode: Reasoning-First (No Answer Key Required)\n")
    
    # 2. Configuration
    # PATH 1: The Student's handwritten work
    script_pdf = "engine/storage/uploads/Algorithm paper.pdf" 
    
    # PATH 2: The Question Paper (Optional if combined)
    qp_pdf = "engine/storage/uploads/Algorithm paper.pdf" 
    
    # Check if files exist
    if not os.path.exists(script_pdf):
        print(f"❌ Error: Script not found at {script_pdf}")
        return

    try:
        # 3. Initialize Agent Architecture
        grader = MultiAgentGrader()
        
        print(f"[STEP 1] Starting Autonomous Workflow...")
        print(f"   -> Processing Script: {os.path.basename(script_pdf)}")
        
        if os.path.exists(qp_pdf):
            print(f"   -> Using Reference Paper: {os.path.basename(qp_pdf)}")
            # Dual-PDF Mode
            report = grader.run_agent_workflow(script_pdf, qp_pdf)
        else:
            print("   -> No separate QP found. Running in Combined PDF mode.")
            # Single-PDF Mode
            report = grader.run_agent_workflow(script_pdf)
        
        # 4. Presentation of Results
        print("\n" + "="*50)
        print("🎓 GRADE REPORT")
        print("="*50)
        print(f" STUDENT: {report.get('studentName')}")
        print(f" EXAM:    {report.get('examTitle')}")
        print(f" TOTAL:   {report.get('points')} ({report.get('gradeLetter')})")
        print("-" * 50)
        
        # 5. Question Breakdown
        for q in report.get("questions", []):
            print(f"\n📍 {q['id']} - STATUS: {q['status'].upper()}")
            print(f"   [REASONING]: {q['correctAnswer'].strip()[:150]}...")
            print(f"   [FEEDBACK]:  {q['feedback'].strip()}")

        # 6. Export to JSON
        report_path = "engine/storage/reports/autonomous_grading_result.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=4)
            
        print("\n" + "="*50)
        print(f"✅ Full AI reasoning saved to: {report_path}")

    except Exception as e:
        print(f"❌ Demo Failed: {e}")

if __name__ == "__main__":
    run_standalone_demo()