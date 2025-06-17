import React, { useState, useEffect } from 'react';
import './TeacherExamCourseSelect.css';
import { MdUpload, MdDashboard } from 'react-icons/md';
import { RiLogoutBoxRLine, RiUpload2Line } from 'react-icons/ri';
import { NavLink, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherExamCourseSelect = () => {
  const [options, setOptions] = useState([]); // [{course, exam}, ...]
  const [course, setCourse] = useState('');
  const [exam, setExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/class-performance/options')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setOptions(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Fetch error fetching dropdown options:', e);
        setError('Failed to load options. Please try again later');
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    if (!course || !exam) {
      alert('Please select both Course and Exam.');
      return;
    }
    navigate('/teacherdashboard', { state: { course, exam } });
  };

  const uniqueCourses = Array.from(new Set(options.map((o) => o.course)));

  const examsForCourse = course
    ? options.filter((o) => o.course === course).map((o) => o.exam)
    : [];

  return (
    <div className="tecs-select-container">
      {/* <div className="tecs-sidebar">
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
            <NavLink to="/logout" className="tecs-nav-item">
              <RiLogoutBoxRLine className="icon" />
              <span>Logout</span>
            </NavLink>
          </li>
        </ul>
      </div> */}
      <TeacherSidebar/>
      <div className="tecs-form-area">
        {loading ? (
          <p>Loading options...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="whole-dropdown">
            <div className="tecs-dropdowns">
              <select value={course} onChange={(e) => { setCourse(e.target.value); setExam(''); }}>
                <option value="">Select Course</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                disabled={!course}>
                <option value="">Select Exam</option>
                {examsForCourse.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            <button className="tecs-done-button" onClick={handleSubmit}>
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherExamCourseSelect;
