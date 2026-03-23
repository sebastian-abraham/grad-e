import cv2
import os
import numpy as np

class VideoProcessor:
    def __init__(self, output_folder="engine/storage/frames"):
        self.output_folder = output_folder
        os.makedirs(self.output_folder, exist_ok=True)

    def get_blur_score(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def extract_sharp_frames(self, video_path, max_frames=20):
        cap = cv2.VideoCapture(video_path)
        frames_with_scores = []
        
        frame_count = 0
        while True:
            success, frame = cap.read()
            if not success:
                break
            

            if frame_count % 5 == 0:
                score = self.get_blur_score(frame)
                frames_with_scores.append((score, frame))
            
            frame_count += 1
            
        cap.release()


        frames_with_scores.sort(key=lambda x: x[0], reverse=True)
        best_frames = frames_with_scores[:max_frames]

        saved_paths = []
        for i, (score, frame) in enumerate(best_frames):
            filename = f"{self.output_folder}/frame_{i}.jpg"
            height, width = frame.shape[:2]
            new_width = 1024
            new_height = int(height * (new_width / width))
            frame = cv2.resize(frame, (new_width, new_height))
            
            cv2.imwrite(filename, frame)
            saved_paths.append(filename)
            
        print(f"[INFO] Extracted {len(saved_paths)} sharp frames.")
        return saved_paths