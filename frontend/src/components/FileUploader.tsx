/**
 * FileUploader component for uploading CSV/Excel files
 */

import React, { useRef, useState } from "react";
import "../styles/FileUploader.css";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  loading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (validTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert("Please upload a CSV or Excel file");
    }
  };

  return (
    <div className="file-uploader">
      <div
        className={`upload-area ${dragActive ? "active" : ""} ${
          loading ? "loading" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <h3>Upload Time Series Data</h3>
        <p>Drag and drop your CSV or Excel file here, or click to browse</p>
        <p className="format-hint">
          Format: First column = dates, other columns = materials/units
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          disabled={loading}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};
