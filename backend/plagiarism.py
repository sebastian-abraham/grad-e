import sys
import json
import base64
import fitz  # PyMuPDF
import io
from PIL import Image
import difflib

try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    import torch
    HAS_TROCR = True
except ImportError:
    HAS_TROCR = False

PROCESSOR = None
MODEL = None

def extract_text_from_pdf(base64_data):
    global PROCESSOR, MODEL
    if not base64_data:
        return ""
    
    pdf_bytes = base64.b64decode(base64_data)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    
    pages_to_process = min(1, len(doc)) 
    
    for page_num in range(pages_to_process):
        page = doc.load_page(page_num)
        
        if HAS_TROCR:
            if PROCESSOR is None:
                PROCESSOR = TrOCRProcessor.from_pretrained('microsoft/trocr-small-printed')
                MODEL = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-small-printed')
            
            pix = page.get_pixmap(dpi=72)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            try:
                pixel_values = PROCESSOR(images=img, return_tensors="pt").pixel_values
                generated_ids = MODEL.generate(pixel_values, max_length=50)
                generated_text = PROCESSOR.batch_decode(generated_ids, skip_special_tokens=True)[0]
                text += generated_text + " "
            except Exception as e:
                text += page.get_text() + " "
        else:
            text += page.get_text() + " "
            
    return text.strip().lower()

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        pairs = json.loads(input_data)
        results = []
        
        for pair in pairs:
            pdf1 = pair.get("pdf1", "")
            pdf2 = pair.get("pdf2", "")
            
            text1 = extract_text_from_pdf(pdf1)
            text2 = extract_text_from_pdf(pdf2)
            
            if not text1 and not text2:
                similarity = 1.0
            elif not text1 or not text2:
                similarity = 0.0
            else:
                similarity = difflib.SequenceMatcher(None, text1, text2).ratio()
                
            pct = round(similarity * 100)
            results.append({
                "studentA": pair.get("studentA"),
                "studentB": pair.get("studentB"),
                "similarity": pct
            })
            
        print(json.dumps({"results": results}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
