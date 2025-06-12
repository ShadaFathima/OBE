import React, { useState } from 'react';
import './TeacherExamCourseSelect.css';
import { MdUpload, MdDashboard } from 'react-icons/md';
import { RiLogoutBoxRLine, RiUpload2Line } from 'react-icons/ri'; // ✅ Properly import RiUpload2Line
import { NavLink } from 'react-router-dom';

const TeacherExamCourseSelect = () => {
  const [exam, setExam] = useState('');
  const [course, setCourse] = useState('');

  const handleSubmit = () => {
    if (!exam || !course) {
      alert('Please select both Exam and Course.');
      return;
    }
    alert(`Exam: ${exam}, Course: ${course}`);
  };

  return (
    <div className="tecs-select-container">
      {/* Sidebar */}
      <div className="tecs-sidebar">
        <h2 className="tecs-logo">TrackMyCO</h2>
        <ul className="tecs-nav-items">
          <li>
            <NavLink
              to="/uploadfirstpage"
              className={({ isActive }) =>
                isActive ? 'tecs-nav-item active' : 'tecs-nav-item'
              }
            >
              <RiUpload2Line className="icon" />
              <span>Upload</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teacherexamcourseselect"
              className={({ isActive }) =>
                isActive ? 'tecs-nav-item active' : 'tecs-nav-item'
              }
            >
              <MdDashboard className="icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/logout"
              className={({ isActive }) =>
                isActive ? 'tecs-nav-item active' : 'tecs-nav-item'
              }
            >
              <RiLogoutBoxRLine className="icon" />
              <span>Logout</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Form Area */}
      <div className="tecs-form-area">
        <div className="whole-dropdown">
          <div className="tecs-dropdowns">
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              <option value="">Exam Name</option>
              <option value="Model Exam">Model Exam</option>
              <option value="Internal">Internal</option>
              <option value="End Semester">End Semester</option>
            </select>

            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Course</option>
              <option value="STA1FM102">STA1FM102</option>
              <option value="MTH1CR02">MTH1CR02</option>
            </select>
          </div>
          <button className="tecs-done-button" onClick={handleSubmit}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherExamCourseSelect;
