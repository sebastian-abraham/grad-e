import ollama
import json
import os
from PIL import Image

class LocalSchemaGenerator:
    def __init__(self):
        self.model_name = "qwen3-vl:8b"

    def _extract_json(self, text):
        try:
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            data = json.loads(text)
            
            if isinstance(data, dict) and "questions" in data:
                return data["questions"]
            elif isinstance(data, list):
                return data
            
            for key, value in data.items():
                if isinstance(value, list):
                    return value
            return [data]
        except Exception as e:
            print(f"\n  ⚠️ [DEBUG] Raw output that failed to parse:\n{text}\n")
            return [] # Return empty list on failure so we can safely extend

    def _compress_for_vram(self, img_path):
        if img_path and os.path.exists(img_path):
            try:
                with Image.open(img_path) as img:
                    # Bumped resolution up for single-page reading!
                    img.thumbnail((1536, 1536))
                    img.save(img_path, optimize=True, quality=85)
            except Exception:
                pass
        return img_path

    def generate_schema(self, qp_img_paths, output_path):
        print(f"\n🧠 [SCHEMA AGENT] Analyzing Question Paper ({len(qp_img_paths)} pages) Page-by-Page...")
        
        all_questions = []

        for idx, img_path in enumerate(qp_img_paths):
            print(f"  --> 👀 Scanning Page {idx + 1}...")
            
            compressed_path = self._compress_for_vram(img_path)

            system_prompt = """You are an expert exam analyzer. Look at this single page of the Question Paper.
            Find EVERY question on THIS PAGE ONLY and extract its point value (marks).
            If there are no questions on this page, return an empty array [].
            
            Return ONLY a JSON object with a single key "questions" containing an array of objects. Do not use markdown. Each object MUST have:
            - "id": The question number (e.g., "Q1", "2a").
            - "context": The exact text of the question.
            - "max_points": The maximum marks awarded for this question (float).

            Example:
            {
                "questions": [
                    {"id": "Q1", "context": "What is Merge Sort?", "max_points": 5.0}
                ]
            }"""

            messages = [
                {"role": "user", "content": system_prompt, "images": [compressed_path]}
            ]

            try:
                response = ollama.chat(
                    model=self.model_name,
                    messages=messages,
                    format="json",
                    keep_alive="2m", # Keep model in memory between pages
                    options={"num_ctx": 4096} # 4k is plenty for a single image
                )
                
                page_data = self._extract_json(response['message']['content'])
                
                if page_data:
                    print(f"  ✅ Found {len(page_data)} questions on Page {idx + 1}.")
                    all_questions.extend(page_data)
                else:
                    print(f"  ⚠️ No valid questions found on Page {idx + 1}.")
                    
            except Exception as e:
                print(f"  ❌ Error scanning Page {idx + 1}: {e}")

        # Once all pages are scanned, force Ollama to drop Qwen from VRAM
        try:
            ollama.chat(model=self.model_name, messages=[], keep_alive="0m")
        except:
            pass

        if all_questions:
            final_schema = {
                "exam_id": os.path.basename(os.path.dirname(output_path)), 
                "questions": all_questions
            }
            with open(output_path, "w") as f:
                json.dump(final_schema, f, indent=4)
            print(f"✅ [SCHEMA AGENT] Successfully built complete schema with {len(all_questions)} questions.")
            return final_schema
        else:
            print(f"❌ [SCHEMA AGENT FATAL] Failed to extract any questions.")
            return None