
import React, { useRef, useState } from "react";

/**
 * UploadModal component
 * Props:
 *   open (bool): whether modal is visible
 *   onClose (func): called to close modal
 *   onUpload (func): called with file when upload is triggered
 */
export default function UploadModal({ open, onClose, onUpload }) {
	const [selectedFile, setSelectedFile] = useState(null);
	const [error, setError] = useState("");
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef();

	if (!open) return null;

	const handleFileChange = (e) => {
		setError("");
		const file = e.target.files[0];
		// Check MIME type and extension for PDF
		const isPdf = file && (
			file.type === "application/pdf" ||
			file.name.toLowerCase().endsWith(".pdf")
		);
		if (!isPdf) {
			setError("Only PDF files are supported.");
			setSelectedFile(null);
		} else {
			setSelectedFile(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			setError("Please select a PDF file.");
			return;
		}
		setUploading(true);
		setError("");
		try {
			// Call parent handler (e.g., send to backend or Gemini API)
			await onUpload(selectedFile);
			setSelectedFile(null);
			onClose();
		} catch (err) {
			setError("Upload failed. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in-95">
				<button
					className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-2xl"
					onClick={onClose}
					aria-label="Close"
				>
					&times;
				</button>
				<h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Upload Answer Sheet</h2>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/pdf"
					className="block w-full text-sm text-slate-700 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
					onChange={handleFileChange}
					disabled={uploading}
				/>
				{selectedFile && (
					<div className="mb-2 text-sm text-slate-600 dark:text-slate-300">
						Selected: <span className="font-medium">{selectedFile.name}</span>
					</div>
				)}
				{error && (
					<div className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</div>
				)}
				<button
					className="mt-2 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-all"
					onClick={handleUpload}
					disabled={uploading}
				>
					{uploading ? "Uploading..." : "Upload"}
				</button>
			</div>
		</div>
	);
}
