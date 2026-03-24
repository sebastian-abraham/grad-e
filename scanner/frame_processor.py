import os

import cv2
import numpy as np

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)


# ---------- Order points for perspective ----------
def order_points(pts):
    pts = pts.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # top-left
    rect[2] = pts[np.argmax(s)]  # bottom-right

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    return rect


# ---------- Perspective transform ----------
def four_point_transform(image, pts):
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))

    dst = np.array(
        [[0, 0], [maxWidth - 1, 0], [maxWidth - 1, maxHeight - 1], [0, maxHeight - 1]],
        dtype="float32",
    )

    M = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(image, M, (maxWidth, maxHeight))


# ---------- Main ----------
def process_frame(session_id: str, raw_bytes: bytes) -> dict:
    try:
        img = cv2.imdecode(np.frombuffer(raw_bytes, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return {"accepted": False, "confidence": 0.0}

        orig = img.copy()
        h, w = img.shape[:2]

        # ---------- Preprocessing ----------
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        edges = cv2.Canny(blur, 50, 150)
        edges = cv2.dilate(edges, None, iterations=2)

        # ---------- Contours ----------
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        page = None
        quad = None

        # ---------- Try to find 4-point page ----------
        for c in contours:
            area = cv2.contourArea(c)

            if area < (h * w) * 0.2:
                continue

            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)

            if len(approx) == 4:
                quad = approx
                break

        # ---------- Perspective transform ----------
        if quad is not None:
            page = four_point_transform(orig, quad.reshape(4, 2))

        # ---------- Fallback 1: bounding box ----------
        if page is None and len(contours) > 0:
            c = contours[0]
            x, y, cw, ch = cv2.boundingRect(c)

            # reject thin strips
            if 0.5 < (cw / float(ch)) < 2.0:
                page = orig[y : y + ch, x : x + cw]

        # ---------- Fallback 2: center crop ----------
        if page is None:
            margin_h = int(h * 0.1)
            margin_w = int(w * 0.1)
            page = orig[margin_h : h - margin_h, margin_w : w - margin_w]

        # ---------- FINAL CLEAN (balanced, no overkill) ----------
        gray = cv2.cvtColor(page, cv2.COLOR_BGR2GRAY)

        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        output = cv2.convertScaleAbs(denoised, alpha=1.2, beta=10)

        # ---------- Save ----------
        count = len([f for f in os.listdir(TEMP_DIR) if f.startswith(session_id)])
        path = os.path.join(TEMP_DIR, f"{session_id}_{count}.jpg")

        cv2.imwrite(path, output)

        return {"accepted": True, "confidence": 0.9, "page_path": path}

    except Exception as e:
        print("Error:", e)
        return {"accepted": False, "confidence": 0.0}
