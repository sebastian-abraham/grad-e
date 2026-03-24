# GRAD-E/main.py
from fastapi import FastAPI, File, UploadFile
import shutil
import os
import uvicorn
from engine.cloud.agents import MultiAgentGrader

app = FastAPI()
ai_agent = MultiAgentGrader()

@app.post("/api/python-grade")
async def process_grading(file: UploadFile = File(...)):
    """
    This endpoint only talks to the Node server.
    It takes the PDF, grades it, and returns the strict JSON.
    """
    try:
        os.makedirs("engine/storage/uploads", exist_ok=True)
        file_path = f"engine/storage/uploads/{file.filename}"
        
        with open(file_path, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # We assume answer_key is handled by the agent's internal knowledge for the demo
        answer_key = "Grade based on general academic correctness."
        
        print("[PYTHON ENGINE] Received file from Node Gateway. Grading...")
        report = ai_agent.run_agent_workflow(file_path, answer_key)
        
        print("[PYTHON ENGINE] Grading Complete. Sending JSON back to Node.")
        return report

    except Exception as e:
        print(f"[PYTHON ERROR] {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Runs on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)