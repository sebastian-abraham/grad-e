import React from "react";
import Webcam from "react-webcam";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Batches from "./pages/Batches";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function FooterNav() {
  return (
    <div className="sticky bottom-0 w-full bg-white dark:bg-[#111a22] border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40">
      <Link to="/" className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined !text-[24px]">
          dashboard
        </span>
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link
        to="/batches"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">
          folder_open
        </span>
        <span className="text-[10px] font-medium">Batches</span>
      </Link>
      <Link
        to="/reports"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">
          bar_chart
        </span>
        <span className="text-[10px] font-medium">Reports</span>
      </Link>
      <Link
        to="/settings"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">settings</span>
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </div>
  );
}

export default function App() {
  const [showWebcam, setShowWebcam] = React.useState(false);
  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
        <button
          style={{ position: 'fixed', top: 10, right: 10, zIndex: 100 }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          onClick={() => setShowWebcam(true)}
        >
          Open Camera
        </button>
        {showWebcam && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
            }}
          >
            <div style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 420 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                style={{ width: '100%', maxWidth: 400 }}
              />
              <div className="flex gap-2 mt-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={capture}>Capture</button>
                <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setShowWebcam(false)}>Close</button>
              </div>
              {imgSrc && (
                <div className="mt-2">
                  <h3 className="text-sm font-bold mb-1">Captured Image:</h3>
                  <img src={imgSrc} alt="Captured" style={{ width: '100%', maxWidth: 400 }} />
                </div>
              )}
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FooterNav />
      </div>
    </BrowserRouter>
  );
}
