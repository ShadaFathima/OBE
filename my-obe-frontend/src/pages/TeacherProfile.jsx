import React from "react";
import "./TeacherProfile.css";
import { MdManageAccounts } from 'react-icons/md';
import { MdDashboard } from 'react-icons/md';
import { BiBadgeCheck } from 'react-icons/bi';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { Link } from "react-router-dom";

const TeacherProfile = () => {
  return (
    <div className="student-container">
      <div className="sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li className="active">
  <MdManageAccounts className="icon" /> Profile
</li>

         <li>
          <Link to="/teacherdashboard">
  <MdDashboard className="icon" /> Dashboard
  </Link>
  </li>

         <li>
          <Link to="/teacherenhancement">
  <BiBadgeCheck className="icon" /> Enhancement
  </Link>
  </li>
          <li>
            <Link to="/teacherlogin">
    <RiLogoutBoxRLine className="icon" /> Logout
    </Link>
  </li>
        </ul>
      </div>

      <div className="profile-card">
        <div className="avatar"></div>
        <h3 className="user-id">346789</h3>

        <div className="field-row">
          <label>Email :</label>
          <input type="text" />
          <span className="edit-link">Edit</span>
        </div>
        
        <div className="field-row">
          <label>Password :</label>
          <input type="password" />
          <span className="edit-link">Edit</span>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfile;
