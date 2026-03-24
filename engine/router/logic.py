import psutil
import torch
import time

class Router:
    def ___init__(self):
        self.cloud_rate_limit_counter = 0
        self.last_reset_time = time.time()
        
    def check_system_health(self):
        if torch.cuda.is_available():
            vram_free = torch.cuda.mem_get_info()[0] / 1024**3 # in GB
            if vram_free < 2.0:
                return "BUSY_LOCAL"
        
        if time.time() - self.last_reset_time > 60:
            self.cloud_rate_limit_counter = 0
            self.last_reset_time = time.time()
            
        if self.cloud_rate_limit_counter >= 15:
            return "BUSY_CLOUD"
            
        return "AVAILABLE"

    def route_request(self, local_ocr_confidence):
        status = self.check_system_health()
        
import psutil
import torch
import time
import os

class Router:
    def __init__(self): # Fixed: Two underscores
        self.cloud_rate_limit_counter = 0
        self.last_reset_time = time.time()
        self.demo_mode = True # Force Cloud for tomorrow's demo
        
    def check_system_health(self):
        # 1. Reset rate limit counter every minute
        if time.time() - self.last_reset_time > 60:
            self.cloud_rate_limit_counter = 0
            self.last_reset_time = time.time()

        # 2. Check GPU/Local Health
        if torch.cuda.is_available():
            try:
                vram_free = torch.cuda.mem_get_info()[0] / 1024**3 
                if vram_free < 2.0:
                    return "BUSY_LOCAL"
            except:
                return "BUSY_LOCAL"
        else:
            return "NO_LOCAL_GPU"
            
        # 3. Check Cloud Health
        if self.cloud_rate_limit_counter >= 15:
            return "BUSY_CLOUD"
            
        return "AVAILABLE"

    def route_request(self, local_ocr_confidence=0.0):
        """
        Routing Hierarchy:
        1. Low Confidence -> Must go to Cloud
        2. Local Busy -> Try Cloud
        3. Both Busy -> Queue
        """
        if self.demo_mode:
            return "PATH_1_CLOUD" # Safety for the interim review

        status = self.check_system_health()

        # Rule 1: Confidence is too low for Local
        if local_ocr_confidence < 0.60:
            if status == "BUSY_CLOUD":
                return "QUEUE"
            self.cloud_rate_limit_counter += 1
            return "PATH_1_CLOUD"

        # Rule 2: Confidence is high, but Local GPU is busy
        if status in ["BUSY_LOCAL", "NO_LOCAL_GPU"]:
            if status == "BUSY_CLOUD":
                return "QUEUE"
            self.cloud_rate_limit_counter += 1
            return "PATH_1_CLOUD"

        # Rule 3: High confidence and Local is available
        return "PATH_2_LOCAL"
        
        
        if local_ocr_confidence < 0.60:
            if status == "BUSY_CLOUD":
                return "QUEUE" 
            self.cloud_rate_limit_counter += 1
            return "PATH_1_CLOUD"
            

        if status == "BUSY_LOCAL":
             if status != "BUSY_CLOUD":
                 self.cloud_rate_limit_counter += 1
                 return "PATH_1_CLOUD"
             else:
                 return "QUEUE"
                 

        return "PATH_2_LOCAL"