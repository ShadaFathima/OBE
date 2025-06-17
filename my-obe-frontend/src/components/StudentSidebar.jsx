import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaBookOpen } from "react-icons/fa"; // Icon for "My Courses"
import './StudentSidebar.css';

const StudentSidebar = ({ registerNumber, course, exam, resultData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const [showConfirm, setShowConfirm] = useState(false);

    // Try to get values from props, then URL params, then location state
    const safeRegisterNumber = registerNumber || params.registerNumber || location.state?.registerNumber || '';
    const safeCourse = course || params.course || location.state?.course || '';
    const safeExam = exam || params.exam || location.state?.exam || '';

    const handleLogoutClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmYes = () => {
        setShowConfirm(false);
        navigate("/studentlogin");
    };

    const handleConfirmNo = () => {
        setShowConfirm(false);
    };

    return (
        <div className="stud-dash-view-sidebar">
            <h2>TrackMyCO</h2>
            <ul>
                <li>
                    <Link to="/studentexamcourseselect" state={{ registerNo: safeRegisterNumber }}>
                        <FaBookOpen className="stud-dash-view-icon" /> My Courses
                    </Link>
                </li>
                <li>
                    {safeRegisterNumber && safeCourse && safeExam ? (
                        <NavLink
                            to={`/studentdashboardview/${encodeURIComponent(safeRegisterNumber)}/${encodeURIComponent(safeCourse)}/${encodeURIComponent(safeExam)}`}
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >

                            <MdDashboard className="stud-dash-view-icon" /> Dashboard
                        </NavLink>
                    ) : (
                        <Link to="/studentexamcourseselect" state={{ registerNo: safeRegisterNumber }}>
                            <MdDashboard className="stud-dash-view-icon" /> Dashboard
                        </Link>
                    )}
                </li>
                <li>
                    <Link
                        to="/studentperformance"
                        state={{
                            weakCOs: resultData?.weak_cos || [],
                            suggestions: resultData?.suggestions || {},
                            registerNumber: safeRegisterNumber,
                            course: safeCourse,
                            exam: safeExam,
                        }}
                    >
                        <BiBadgeCheck className="stud-dash-view-icon" /> Enhancement
                    </Link>

                </li>

                <li>
                    <button className="logout-btn" onClick={handleLogoutClick}>
                        <RiLogoutBoxRLine className="stud-dash-view-icon" /> Logout
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

export default StudentSidebar;
