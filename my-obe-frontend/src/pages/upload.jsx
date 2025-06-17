import React, { useState, useEffect } from 'react';
import './upload.css';
import axios from 'axios';
import { WiCloudUp } from "react-icons/wi";
import { NavLink } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine, RiUpload2Line } from "react-icons/ri";
import TeacherSidebar from '../components/TeacherSidebar';

const Uploading = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No File Chosen");
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    document.body.style.backgroundColor = '#f8f8ff';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      alert("Only .xlsx Excel files are allowed.");
      e.target.value = null; // Clear the input
      setFile(null);
      setFileName("No File Chosen");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile?.name || "No File Chosen");
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please select a valid Excel (.xlsx) file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true); // Start loading
      const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ File uploaded successfully!");
      console.log("Server response:", response.data);

      // Reset after success
      setFile(null);
      setFileName("No File Chosen");
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ Error uploading file: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="upload-container">
      <TeacherSidebar />
      <div className="upload-main-content">
        <div className='upload-box'>
          <h3>Upload Student Marks</h3>
          <div className="upload-section">
            <div className="upload-view">
              <label className="browse-btn">
                <WiCloudUp className='upload-icon' />
                Browse Files
                <input
                  type="file"
                  hidden
                  accept=".xlsx"
                  onChange={handleFileChange}
                />
              </label>
              <span className="file-status">{fileName}</span>
            </div>

            <button className="upload-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Processing File..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploading;
