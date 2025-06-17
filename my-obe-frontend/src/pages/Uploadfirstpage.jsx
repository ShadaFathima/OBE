import React, { useEffect } from 'react';
import './Uploadfirstpage.css';
import { RiUploadCloud2Fill, RiUpload2Line, RiLogoutBoxRLine } from "react-icons/ri";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { MdUpload } from "react-icons/md";
import TeacherSidebar from '../components/TeacherSidebar';
const Uploadfirstpage = () => {
    useEffect(() => {
        document.body.style.backgroundColor = '#f8f8ff';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="upload-first-page-container">
            <div className="upload-first-page-sidebar">
                <h2>TrackMyCO</h2>
                <ul>
                    <li>
                        <NavLink to="/upload" className="active">
                            <RiUpload2Line className="icon" /> Upload
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/teacherexamcourseselect">
                            <MdDashboard className="icon" /> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/teacherlogin">
                            <RiLogoutBoxRLine className="icon" /> Logout
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="upload-first-page-main-content">
                <div className="upload-first-page-options-container">
                    <NavLink to="/upload" className="upload-first-page-option-box">
                        <RiUploadCloud2Fill className="upload-first-page-icon" />
                        <span>Upload Class-wise<br />Marks</span>
                    </NavLink>
                    <NavLink to="/comapping" className="upload-first-page-option-box">
                        <MdUpload className="upload-first-page-icon" />
                        <span>Individual Entry</span>
                    </NavLink>

                </div>
            </div>
        </div>
    );
};

export default Uploadfirstpage;
