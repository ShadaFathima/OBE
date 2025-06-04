import React from "react";
import "./StudentPerformance.css";
import { useLocation, NavLink, Link } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";

const StudentPerformance = () => {
  const location = useLocation();

  return (
    <div className="stud-perf-student-container">
      <div className="stud-perf-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <Link to="/studentdashboard">
              <MdManageAccounts className="stud-perf-icon" /> Profile
            </Link>
          </li>

          <li>
            <Link to="/studentdashboardview">
              <MdDashboard className="stud-perf-icon" /> Dashboard
            </Link>
          </li>

           <li>
                      <NavLink
                        to="/studentperformance"
                        className={({ isActive }) => isActive ? "active" : ""}
                      >
                        <BiBadgeCheck className="stud-perf-icon" /> Performance
                      </NavLink>
                    </li>

          <li>
            <Link to="/studentlogin">
              <RiLogoutBoxRLine className="stud-perf-icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="stud-perf-main-content">
        <h2 className="stud-perf-title">Suggestions to Improve your Performance</h2>

        <div className="stud-perf-section">
          <h3>Documentations</h3>
          <div className="stud-perf-doc-cards">
            {[1, 2, 3].map((_, i) => (
              <div className="stud-perf-doc-card" key={i}>
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

        <div className="stud-perf-section">
          <h3>Videos</h3>
          <div className="stud-perf-video-thumbnails">
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

export default StudentPerformance;
