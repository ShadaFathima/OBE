import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { RiUpload2Line, RiLogoutBoxRLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import './TeacherSidebar.css';

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    navigate("/teacherlogin");
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  return (
    <div className="teac-dash-sidebar">
      <h2>TrackMyCO</h2>
      <ul>
        <li>
          <NavLink to="/uploadfirstpage">
            <RiUpload2Line className="icon" /> Upload
          </NavLink>
        </li>
        <li>
          <NavLink to="/teacherexamcourseselect">
            <MdDashboard className="icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <button className="logout-btn" onClick={handleLogoutClick}>
            <RiLogoutBoxRLine className="icon" /> Logout
          </button>
        </li>
      </ul>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="yes-btn" onClick={handleConfirmYes}>Yes</button>
              <button className="no-btn" onClick={handleConfirmNo}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSidebar;
