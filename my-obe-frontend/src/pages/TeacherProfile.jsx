import React from "react";
import "./TeacherProfile.css";
import { MdManageAccounts } from 'react-icons/md';
import { MdDashboard } from 'react-icons/md';
import { BiBadgeCheck } from 'react-icons/bi';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { NavLink, useLocation, Link } from "react-router-dom";
import { RiUpload2Line } from 'react-icons/ri';

const TeacherProfile = () => {
  return (
    <div className="teac-pro-container">
      <div className="teac-pro-sidebar">
        <h2>TrackMyCO</h2>
               <ul>
                 <li>
                   <NavLink to="/teacherprofile" className="active">
                     <MdManageAccounts className="icon" /> Profile
                   </NavLink>
                 </li>
                 <li>
                   <NavLink to="/uploading" >
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

      <div className="teac-pro-profile-card">
        <div className="teac-pro-avatar"></div>
        <h3 className="teac-pro-user-id">346789</h3>

        <div className="teac-pro-field-row">
          <label>Email :</label>
          <input type="email" />
          <span className="teac-pro-edit-link">Edit</span>
        </div>

        <div className="teac-pro-field-row">
          <label>Password :</label>
          <input type="password" />
          <span className="teac-pro-edit-link">Edit</span>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfile;
