import React from "react";
import "./StudentDashboard.css";
import { NavLink } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";

const StudentDashboard = () => {
  const registerNumber = "FKAYSCS012";

  return (
    <div className="stud-dash-student-container">
      <div className="stud-dash-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink
              to="/studentdashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdManageAccounts className="stud-dash-icon" /> Profile
            </NavLink>
          </li>

          <li>
            <NavLink
              to={`/studentdashboardview/${registerNumber}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdDashboard className="stud-dash-icon" /> Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/studentperformance"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <BiBadgeCheck className="stud-dash-icon" /> Performance
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/studentlogin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <RiLogoutBoxRLine className="stud-dash-icon" /> Logout
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="stud-dash-profile-card">
        <div className="stud-dash-avatar"></div>
        <h3 className="stud-dash-user-id">{registerNumber}</h3>

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
