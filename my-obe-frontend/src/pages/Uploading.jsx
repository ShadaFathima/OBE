import React, { useState, useEffect } from 'react';
import './Uploading.css';
import { FaPlus, FaFileUpload } from 'react-icons/fa';
import { NavLink, useLocation } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine, RiUpload2Line } from "react-icons/ri";

const Uploading = () => {
  const [qcoFields, setQcoFields] = useState([['', '']]);
  const [coFields, setCoFields] = useState([['', '']]);
  const [fileName, setFileName] = useState("No File Chosen");

  useEffect(() => {
    document.body.style.backgroundColor = '#f8f8ff'; 
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);


  const addQcoField = () => setQcoFields([...qcoFields, ['', '']]);
  const addCoField = () => setCoFields([...coFields, ['', '']]);

  return (
    <div className="upload-container">
      <div className="upload-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink to="/teacherprofile">
              <MdManageAccounts className="icon" /> Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/uploads" className="active">
              <RiUpload2Line className="icon" /> Upload
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherdashboard" >
              <MdDashboard className="icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherenhancement">
              <BiBadgeCheck className="icon" /> Enhancement
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherlogin" >
              <RiLogoutBoxRLine className="icon" /> Logout
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="upload-main-content">
        <div className='upload-box'>
        <h3>Question to CO Mapping</h3>
        {qcoFields.map((field, index) => (
          <div className="row" key={index}>
            <input type="text" placeholder="Enter question" />
            <input type="text" placeholder="Enter CO" />
          </div>
        ))}
        <button className="add-btn" onClick={addQcoField}><FaPlus /> Add More</button>

        <h3>CO Definitions</h3>
        {coFields.map((field, index) => (
          <div className="row" key={index}>
            <input type="text" placeholder="Enter CO Number" />
            <input type="text" placeholder="Enter CO Definition" />
          </div>
        ))}
        <button className="add-btn" onClick={addCoField}><FaPlus /> Add More</button>

        <div className="upload-section">
          <label className="browse-btn">
            <FaFileUpload /> Browse Files
            <input
              type="file"
              hidden
              onChange={(e) =>
                setFileName(e.target.files[0]?.name || "No File Chosen")
              }
            />
          </label>
          <span className="file-status">{fileName}</span>
          <button className="upload-btn">Upload</button>
        </div>
      </div>
      </div>
      
    </div>
  );
};

export default Uploading;
