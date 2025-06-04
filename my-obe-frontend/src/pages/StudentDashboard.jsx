import React from "react";
import "./StudentDashboard.css";
import { NavLink, useLocation, Link } from "react-router-dom";
import { MdManageAccounts } from 'react-icons/md';
import { MdDashboard } from 'react-icons/md';
import { BiBadgeCheck } from 'react-icons/bi';
import { RiLogoutBoxRLine } from 'react-icons/ri';


const StudentDashboard = () => {
  return (
    <div className="stud-dash-student-container">
      <div className="stud-dash-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li >
            <NavLink
              to="/studentdashboard"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              <MdManageAccounts className="stud-dash-icon" /> Profile
            </NavLink>

          </li>

          <li>
            <NavLink to="/studentdashboardview">
              <MdDashboard className="stud-dash-icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/studentperformance">
              <BiBadgeCheck className="stud-dash-icon" /> Performance
            </NavLink>
          </li>

          <li>
            <NavLink to="/studentlogin">
              <RiLogoutBoxRLine className="stud-dash-icon" /> Logout
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="stud-dash-profile-card">
        <div className="stud-dash-avatar"></div>
        <h3 className="stud-dash-user-id">FKAVSEC687</h3>

        <div className="stud-dash-field-row">
          <label>Email :</label>
          <input type="text" />
          <span className="stud-dash-edit-link">Edit</span>
        </div>

        <div className="stud-dash-field-row">
          <label>Password :</label>
          <input type="password" />
          <span className="stud-dash-edit-link">Edit</span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
