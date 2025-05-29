import React from "react";
import "./TeacherEnhancement.css";
import { Link, useLocation } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";

const TeacherEnhancement = () => {
  const location = useLocation();

  return (
    <div className="student-container">
      <div className="sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <Link to="/teacherprofile">
            <MdManageAccounts className="icon" /> Profile
            </Link>
          </li>

          <li>
            <Link to="/teacherdashboard">
            <MdDashboard className="icon" /> Dashboard
            </Link>
          </li>

          <li className="active">
            <BiBadgeCheck className="icon" /> Enhancement
          </li>

          <li>
            <Link to="/teacherlogin">
            <RiLogoutBoxRLine className="icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h2 className="title">Suggestions to Improve your Performance</h2>

        <div className="section">
          <h3>Documentations</h3>
          <div className="doc-cards">
            {[1, 2, 3].map((_, i) => (
              <div className="doc-card" key={i}>
                <h4>CO{i + 1} (Fundamentals of Data Analysis)</h4>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting
                  industry. Lorem Ipsum has been the industry's standard dummy text
                  ever since the 1500s, when an unkn ... <a href="#">Read more</a>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>Videos</h3>
          <div className="video-thumbnails">
            <iframe
              width="280"
              height="160"
              src="https://www.youtube.com/embed/2WaQZNR5e6A"
              title="Data Analytics Video 1"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>

            <iframe
              width="280"
              height="160"
              src="https://www.youtube.com/embed/naB2g7y8YlQ"
              title="Data Analytics Video 2"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherEnhancement;
