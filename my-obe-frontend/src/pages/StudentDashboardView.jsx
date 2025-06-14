import React, { useEffect, useState } from "react";
import "./StudentDashboardView.css";
import { useParams, Link, NavLink } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";

const StudentDashboardView = () => {
  const { registerNumber, exam, course } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    if (!registerNumber) {
      setError("No register number provided");
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      try {
        const [resultRes, detailsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/results/${registerNumber}?exam=${exam}&course=${course}`),
          fetch(`http://localhost:8000/api/student_details/${registerNumber}?exam=${exam}&course=${course}`),
        ]);

        if (!resultRes.ok || !detailsRes.ok) {
          throw new Error("Failed to fetch student data");
        }

        const resultJson = await resultRes.json();
        const detailsJson = await detailsRes.json();

        setResultData(resultJson);
        setStudentDetails(detailsJson);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [registerNumber]);

  if (loading) return <div>Loading student data...</div>;
  if (error) return <div>Error: {error}</div>;

  const coScores = [];
  for (let i = 1; i <= 6; i++) {
    coScores.push({
      name: `CO${i}`,
      score: studentDetails?.[`co${i}`] || 0,
      description: resultData?.suggestions?.[`CO${i}`]?.definition || "No description available",
    });
  }

  const averageScore = resultData?.percentage || 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - averageScore) / 100) * circumference;

  return (
    <div className="stud-dash-view-student-container">
      <div className="stud-dash-view-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink
              to={`/studentdashboardview/${registerNumber}`}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdDashboard className="stud-dash-view-icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <Link
              to="/studentperformance"
              state={{
                weakCOs: resultData?.weak_cos || [],
                suggestions: resultData?.suggestions || {},
                registerNumber: registerNumber,
              }}
            >
              <BiBadgeCheck className="stud-dash-view-icon" /> Enhancement
            </Link>
          </li>
          <li>
            <Link to="/studentlogin">
              <RiLogoutBoxRLine className="stud-dash-view-icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="stud-dash-view-main-content">
        <div className="stud-dash-view-dashboard">
          <div className="stud-dash-view-chart-section">
            {/* Line Chart */}
            <div className="stud-dash-view-chart-box">
              <h3>CO Line Chart</h3>
              <LineChart width={400} height={250} data={coScores}>
                <Line type="monotone" dataKey="score" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
              </LineChart>
            </div>

            {/* Bar Chart (Updated Gradient Style) */}
            <div className="stud-dash-view-chart-box">
              <h3>CO Bar Chart</h3>
              <BarChart width={400} height={250} data={coScores}>
                <defs>
                  {["#b8aaff", "#ffc2c2", "#a0ecff", "#ffe299", "#b0ccff", "#ff4fff"].map(
                    (startColor, idx) => {
                      const endColors = ["#8979ff", "#ff8c8c", "#6ec6ff", "#ffd166", "#80aaff", "#aa0f80"];
                      return (
                        <linearGradient id={`coGradient${idx + 1}`} x1="0" y1="0" x2="0" y2="1" key={idx}>
                          <stop offset="0%" stopColor={startColor} />
                          <stop offset="100%" stopColor={endColors[idx]} />
                        </linearGradient>
                      );
                    }
                  )}
                </defs>
                <Bar dataKey="score">
                  {coScores.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#coGradient${(index % 6) + 1})`} />
                  ))}
                  <LabelList
                    dataKey="score"
                    position="top"
                    formatter={(value) => value.toFixed(2)}
                    style={{ fontSize: "13.8" }}
                  />
                </Bar>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
              </BarChart>
            </div>
          </div>

          <div className="stud-dash-view-score-average-row">
            <div className="stud-dash-view-score-feed-container">
              <div className="stud-dash-view-score-section">
                <h3>Score</h3>
                <div className="stud-dash-view-score-cards">
                  {coScores.map((co, index) => (
                    <div
                      key={index}
                      className="stud-dash-view-score-card-with-tooltip"
                    >
                      <div className="stud-dash-view-score-card">
                        <div>{co.score.toFixed(2)}</div>
                        <small>{co.name}</small>
                      </div>
                      <div className="stud-dash-view-tooltip">
                        <p>{co.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stud-dash-view-feedback-box">
                <h3>Feedback</h3>
                <p>
                  Every expert was once a beginner. This is your stage 🎯{" "}
                  <span
                    style={{
                      color: "rgb(255, 133, 133)",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {resultData?.performance || "No feedback available"}
                  </span>
                  . Let’s start from here.
                </p>
              </div>
            </div>

            <div className="stud-dash-view-average-box">
              <h3>Average</h3>
              <div className="stud-dash-view-img-box">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#e6e6e6"
                    strokeWidth="15"
                    fill="none"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="rgba(255, 146, 133, 0.4)"
                    strokeWidth="15"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="Square"
                    transform="rotate(-90 100 100)"
                  />
                  <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    fontSize="48"
                    fill="rgba(255, 146, 133, 0.7)"
                    fontWeight="light"
                  >
                    {Math.round(averageScore)}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView;
