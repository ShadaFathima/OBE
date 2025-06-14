import React, { useState, useEffect } from 'react';
import './StudentExamCourseSelect.css';
import { MdDashboard } from 'react-icons/md';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const StudentExamCourseSelect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registerNo = location.state?.registerNo;

  const [course, setCourse] = useState('');
  const [exam, setExam] = useState('');
  const [courseExamPairs, setCourseExamPairs] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registerNo?.trim()) {
      setLoading(true);
      fetch(`http://localhost:8000/api/student_details_info/${registerNo}`)
        .then((res) => {
          if (!res.ok) throw new Error('Student not found');
          return res.json();
        })
        .then((data) => {
          setCourseExamPairs(data);
          const uniqueCourses = [...new Set(data.map(item => item.course))];
          setAvailableCourses(uniqueCourses);
        })
        .catch((err) => {
          console.error(err);
          setCourseExamPairs([]);
          setAvailableCourses([]);
          setAvailableExams([]);
          setCourse('');
          setExam('');
          setError('Student not found or has no exams.');
        })
        .finally(() => setLoading(false));
    }
  }, [registerNo]);

  useEffect(() => {
    if (course && courseExamPairs.length > 0) {
      const exams = courseExamPairs
        .filter(pair => pair.course === course)
        .map(pair => pair.exam);
      const uniqueExams = [...new Set(exams)];
      setAvailableExams(uniqueExams);
      setExam('');
    } else {
      setAvailableExams([]);
    }
  }, [course, courseExamPairs]);

  const handleSubmit = () => {
    if (!registerNo || !course || !exam) {
      alert('Please select course, exam, and ensure register number is valid.');
      return;
    }

    navigate(
      `/studentdashboardview/${encodeURIComponent(registerNo)}/${encodeURIComponent(course)}/${encodeURIComponent(exam)}`
    );
  };

  return (
    <div className="secs-container">
      <div className="secs-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              <MdDashboard className="secs-icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/studentlogin">
              <RiLogoutBoxRLine className="secs-icon" /> Logout
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="secs-form">
        <div className="secs-dropdown-wrapper">
          {loading && <p>Loading available courses and exams...</p>}

          <div className="secs-dropdowns">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={!availableCourses.length || loading}
              className={!availableCourses.length ? "secs-disabled" : ""}
            >
              <option value="">Select Course</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              disabled={!availableExams.length || loading}
              className={!availableExams.length ? "secs-disabled" : ""}
            >
              <option value="">Select Exam</option>
              {availableExams.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <button className="secs-button" onClick={handleSubmit}>
            DONE
          </button>

          {error && <p className="secs-error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentExamCourseSelect;
