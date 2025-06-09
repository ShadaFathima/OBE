import React, { useEffect, useState } from "react";
import "./StudentPerformance.css";
import { useLocation, NavLink, Link } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";

const StudentPerformance = () => {
  const location = useLocation();
  const [registerNumber, setRegisterNumber] = useState("");
  const [weakCOs, setWeakCOs] = useState([]);
  const [suggestions, setSuggestions] = useState({});

  useEffect(() => {
    const fetchStudentResult = async () => {
      try {
        const regNo = localStorage.getItem("register_number");
        setRegisterNumber(regNo);

        const response = await fetch(`http://localhost:8000/results/${regNo}`);
        if (!response.ok) {
          throw new Error("Failed to fetch result");
        }
        const data = await response.json();
        setWeakCOs(data.weak_cos || []);
        setSuggestions(data.suggestions || {});
      } catch (error) {
        console.error("Error fetching student result:", error);
      }
    };

    fetchStudentResult();
  }, []);

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
            <Link to={`/studentdashboardview/${registerNumber}`}>
              <MdDashboard className="stud-perf-icon" /> Dashboard
            </Link>
          </li>
          <li>
            <NavLink
              to="/studentperformance"
              className={({ isActive }) => (isActive ? "active" : "")}
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

        {/* Documentations */}
        <div className="stud-perf-section">
          <h3>Documentations</h3>
          <div className="stud-perf-doc-cards">
            {weakCOs.length === 0 ? (
              <p>No weak COs detected 🎉</p>
            ) : (
              weakCOs.map((co, index) => (
                <div className="stud-perf-doc-card" key={index}>
                  <h4>{co}</h4>
                  <p>
                    {suggestions[co]?.definition || "No description available."}
                    {suggestions[co]?.material?.length > 0 && (
                      <>
                        <br />
                        <a
                          href={suggestions[co].material[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read more
                        </a>
                      </>
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Videos */}
        <div className="stud-perf-section">
          <h3>Videos</h3>
          <div className="stud-perf-video-thumbnails">
            {weakCOs.flatMap((co, index) =>
              (suggestions[co]?.youtube_videos || []).map((video, vidIndex) => (
                <iframe
                  key={`${index}-${vidIndex}`}
                  width="280"
                  height="160"
                  src={video.url.replace("watch?v=", "embed/")}
                  title={video.title || `Video for ${co}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ))
            )}
            {weakCOs.length === 0 && <p>No videos to show.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
