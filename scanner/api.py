from fastapi import FastAPI, Form, UploadFile
from frame_processor import process_frame
from stitcher import stitch_to_pdf

app = FastAPI()


@app.post("/process-frame")
async def process_frame_api(session_id: str = Form(...), file: UploadFile = ...):
    raw = await file.read()
    return process_frame(session_id, raw)


@app.post("/finalize")
async def finalize(session_id: str = Form(...)):
    pdf_path = stitch_to_pdf(session_id)
    return {"pdf_path": pdf_path}
