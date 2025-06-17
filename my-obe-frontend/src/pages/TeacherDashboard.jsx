import React, { useEffect, useState } from "react";
import "./TeacherDashboard.css";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import axios from "axios";
import { RiLogoutBoxRLine, RiUpload2Line } from "react-icons/ri";
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
} from "recharts";

const coGradients = {
  CO1: "figmaGradient",
  CO2: "sketchGradient",
  CO3: "xdGradient",
  CO4: "psGradient",
  CO5: "aiGradient",
  CO6: "co6Gradient",
};

const TeacherDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, exam } = location.state || {};
  const [performanceData, setPerformanceData] = useState([]);
  const [latestExamData, setLatestExamData] = useState(null);

  useEffect(() => {
    const fetchAllPerformance = async () => {
      if (!course) return;
      try {
        const response = await axios.get("http://localhost:8000/api/class_performance/all_exams/", {
          params: { course },
        });
        setPerformanceData(response.data);
      } catch (error) {
        console.error("Error fetching all exam performances:", error);
      }
    };

    const fetchLatestPerformance = async () => {
      if (!course || !exam) return;
      try {
        const response = await axios.get("http://localhost:8000/api/class_performance/", {
          params: { course, exam },
        });
        setLatestExamData(response.data);
      } catch (error) {
        console.error("Error fetching latest performance:", error);
      }
    };

    fetchAllPerformance();
    fetchLatestPerformance();
  }, [course, exam]);

  const lineData = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"].map((co, coIndex) => {
    const coData = { name: co };
    performanceData.forEach((item) => {
      coData[item.exam] = item[`co${coIndex + 1}_avg`];
    });
    return coData;
  });

  const scores = latestExamData
    ? [
        latestExamData.co1_avg,
        latestExamData.co2_avg,
        latestExamData.co3_avg,
        latestExamData.co4_avg,
        latestExamData.co5_avg,
        latestExamData.co6_avg,
      ]
    : [0, 0, 0, 0, 0, 0];

  const averageScore = latestExamData?.class_performance ?? 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - averageScore) / 100) * circumference;

  const barData = scores.map((value, index) => ({
    name: `CO${index + 1}`,
    value,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            color: "#333",
            fontSize: "12px",
          }}
        >
          <p><strong>{label}</strong></p>
          {payload.map((item, i) => (
            <p key={i} style={{ color: item.stroke }}>
              {item.dataKey}: {item.value?.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleGoToReport = () => {
    navigate("/report", {
      state: {
        course,
        exam
      }
    });
  };

  return (
    <div className="teac-dash-student-container">
      <div className="teac-dash-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink to="/uploadfirstpage">
              <RiUpload2Line className="icon" /> Upload
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherexamcourseselect" className="active">
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

      <div className="teac-dash-main-content">
        <div className="teac-dash-dashboard">
          <div className="teac-dash-chart-section">
            <div className="teac-dash-chart-box">
              <h3>CO Performance</h3>
              <LineChart width={400} height={250} data={lineData}>
                {performanceData.map((exam, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={exam.exam}
                    stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bcd4"][i % 5]}
                  />
                ))}
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </div>

            <div className="teac-dash-chart-box">
              <h3>CO Graph</h3>
              <BarChart width={400} height={250} data={barData}>
                <defs>
                  <linearGradient id="figmaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0d2eb" />
                    <stop offset="100%" stopColor="#8979ff" />
                  </linearGradient>
                  <linearGradient id="sketchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffbdbd" />
                    <stop offset="100%" stopColor="#ff8c8c" />
                  </linearGradient>
                  <linearGradient id="xdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d1f0ff" />
                    <stop offset="100%" stopColor="#6ec6ff" />
                  </linearGradient>
                  <linearGradient id="psGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff3c4" />
                    <stop offset="100%" stopColor="#ffd166" />
                  </linearGradient>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bfd7ff" />
                    <stop offset="100%" stopColor="#80aaff" />
                  </linearGradient>
                  <linearGradient id="co6Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffd1dd" />
                    <stop offset="100%" stopColor="#aa0f80" />
                  </linearGradient>
                </defs>
                <Bar dataKey="value">
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={`url(#${coGradients[entry.name] || "figmaGradient"})`} />
                  ))}
                </Bar>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
              </BarChart>
            </div>
          </div>

          <div className="teac-dash-score-average-row">
            <div className="teac-dash-score-feed-container">
              <div className="teac-dash-score-section">
                <h3>Category</h3>
                <div className="teac-dash-score-cards">
                  {scores.map((score, index) => (
                    <div key={index} className="teac-dash-score-card">
                      <div>{score.toFixed(1)}</div>
                      <small>CO{index + 1}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="teac-dash-feedback-box">
                <h3>Feedback</h3>
                <div className="feed-container">
                   <p>
                  {averageScore >= 85
                    ? "Excellent overall CO performance."
                    : averageScore >= 65
                    ? "Good performance, but some COs can be improved."
                    : "Needs improvement in several COs."}
                    
                </p>
                  <button
                    className="report-button"
                    onClick={() => navigate("/report", { state: { course, exam } })}
                  >
                    View CO Report
                  </button>

                </div>
               
                
              </div>
            </div>

            <div className="teac-dash-average-box">
              <h3>Average</h3>
              <div className="teac-dash-img-box">
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
                    fill="#ff9285"
                    fontWeight="light"
                  >
                    {averageScore.toFixed(1)}%
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

export default TeacherDashboard;
