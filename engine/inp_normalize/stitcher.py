from PIL import Image
import os

class PDFStitcher:
    def __init__(self, output_folder="engine/storage/payloads"):
        self.output_folder = output_folder
        os.makedirs(self.output_folder, exist_ok=True)

    def stitch_images_to_pdf(self, image_paths, student_id):
        if not image_paths:
            print("[WARN] No images provided to stitch.")
            return None

        images = []
        for path in image_paths:
            try:
                img = Image.open(path)
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                images.append(img)
            except Exception as e:
                print(f"[ERROR] Could not open image {path}: {e}")

        if not images:
            return None

        output_path = f"{self.output_folder}/{student_id}_submission.pdf"
        

        images[0].save(
            output_path, "PDF", resolution=100.0, save_all=True, append_images=images[1:]
        )
        
        print(f"[INFO] Stitched {len(image_paths)} images into {output_path}")
        return output_path