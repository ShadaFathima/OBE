import React, { useState } from "react";
import axios from "axios";
import "./upload.css";

function Upload() {
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully!");
      console.log("Server response:", response.data);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Error uploading file: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-6">Upload Student Marks Excel</h1>
      <p className="text-sm text-gray-600 mb-4">
        Ensure your Excel file has the following sheets: <strong>marks</strong>, <strong>CO_Mapping</strong>, <strong>CO_Definitions</strong>
      </p>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-6 block"
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
      >
        Upload and Analyze
      </button>
    </div>
  );
}

export default Upload;
