import cv2
import os
import numpy as np

class VideoProcessor:
    def __init__(self, output_folder="engine/storage/frames"):
        self.output_folder = output_folder
        # Ensure the storage directory exists for the frames
        os.makedirs(self.output_folder, exist_ok=True)

    def get_blur_score(self, image):
        """
        Calculates the Laplacian variance. 
        A high variance means the image is sharp; low means it's blurry.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def extract_sharp_frames(self, video_path, max_frames=15):
        cap = cv2.VideoCapture(video_path)
        frames_with_scores = []
        
        frame_count = 0
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            # Optimization: Only check every 10th frame to save CPU time
            if frame_count % 10 == 0:
                score = self.get_blur_score(frame)
                frames_with_scores.append((score, frame))
            
            frame_count += 1
            
        cap.release()

        # Sort by sharpness (Highest score first) and take top N
        frames_with_scores.sort(key=lambda x: x[0], reverse=True)
        best_frames = frames_with_scores[:max_frames]

        saved_paths = []
        for i, (score, frame) in enumerate(best_frames):
            filename = os.path.join(self.output_folder, f"frame_{i}.jpg")
            
            # Normalization: Resize to 1024px width to reduce Gemini token usage
            height, width = frame.shape[:2]
            new_width = 1024
            new_height = int(height * (new_width / width))
            resized_frame = cv2.resize(frame, (new_width, new_height))
            
            cv2.imwrite(filename, resized_frame)
            saved_paths.append(filename)
            
        print(f"[VIDEO PROCESSOR] Extracted {len(saved_paths)} sharp frames from video.")
        return saved_paths