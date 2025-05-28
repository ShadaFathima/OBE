import React from "react";
import "./StudentDashboard.css";
import { Link } from "react-router-dom";
import { MdManageAccounts } from 'react-icons/md';
import { MdDashboard } from 'react-icons/md';
import { BiBadgeCheck } from 'react-icons/bi';
import { RiLogoutBoxRLine } from 'react-icons/ri';


const StudentDashboard = () => {
  return (
    <div className="student-container">
      <div className="sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li className="active">
  <MdManageAccounts className="icon" /> Profile
</li>

         <li>
  <Link to="/studentdashboardview">
    <MdDashboard className="icon" /> Dashboard
  </Link>
</li>
        <li>
         <Link to="/studentperformance">
  <BiBadgeCheck className="icon" /> Performance
</Link>
</li>

         <li>
          <Link to="/studentlogin">
          <RiLogoutBoxRLine className="icon" /> Logout
          </Link>
        </li>
        </ul>
      </div>

      <div className="profile-card">
        <div className="avatar"></div>
        <h3 className="user-id">FKAVSEC687</h3>

        <div className="field-row">
          <label>Email :</label>
          <input type="email" />
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

export default StudentDashboard;
