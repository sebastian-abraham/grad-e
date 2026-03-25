import os
import gc
import torch
import base64
from io import BytesIO
from PIL import Image
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
from byaldi import RAGMultiModalModel

class LocalColPaliIndexer:
    def __init__(self, storage_dir="engine/storage/local_crops"):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.rag_model = None
        
    def load_model(self):
        print("🧠 [LOCAL] Loading ColPali-v1.2 into VRAM...")
        self.rag_model = RAGMultiModalModel.from_pretrained("vidore/colpali-v1.2")
        
    def unload_model(self):
        print("🧹 [LOCAL] Unloading ColPali and clearing VRAM...")
        del self.rag_model
        self.rag_model = None
        import gc
        import torch
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def create_index(self, pdf_path, index_name):
        if not self.rag_model:
            self.load_model()
            
        print(f"📄 [LOCAL] Indexing {pdf_path} as '{index_name}'...")
        self.rag_model.index(
            input_path=pdf_path,
            index_name=index_name,
            store_collection_with_index=True,
            overwrite=True
        )
        print(f"✅ [LOCAL] Index '{index_name}' created successfully.")

    def extract_crop(self, index_name, query, output_prefix, k=2):
        """Searches the index and saves the Top-K image patches to disk."""
        if not self.rag_model:
            self.rag_model = RAGMultiModalModel.from_index(index_name)

        print(f"🔍 [LOCAL] Searching '{index_name}' for Top-{k}: '{query}'")
        results = self.rag_model.search(query, k=k) 
        
        saved_paths = []
        if results:
            for rank, result in enumerate(results):
                if result.base64:
                    image_data = base64.b64decode(result.base64)
                    image = Image.open(BytesIO(image_data))
                    
                    # Save as part1, part2, etc.
                    save_filename = f"{output_prefix}_part{rank + 1}.png"
                    save_path = os.path.join(self.storage_dir, save_filename)
                    image.save(save_path)
                    saved_paths.append(save_path)
            
            print(f"📸 [LOCAL] Saved {len(saved_paths)} crops for {output_prefix}")
            return saved_paths
        else:
            print(f"⚠️ [LOCAL] Could not find a match for '{query}'")
            return []