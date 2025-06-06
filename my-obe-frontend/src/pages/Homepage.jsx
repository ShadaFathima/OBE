import React from 'react';
import './Homepage.css'; 
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">TrackMyCO</h1>
      <div className="home-nav-boxes">
        <div className="home-nav-box" onClick={() => navigate('/authoritylogin')}>
          <FaUniversity size={60} color='#000'/>
          <p className="home-nav-label">Authority</p>
        </div>
        <div className="home-nav-box" onClick={() => navigate('/teacherlogin')}>
          <FaChalkboardTeacher size={60} color='#000'/>
          <p className="home-nav-label">Teacher</p>
        </div>
        <div className="home-nav-box" onClick={() => navigate('/studentlogin')}>
          <FaUserGraduate size={60} color='#000'/>
          <p className="home-nav-label">Student</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
