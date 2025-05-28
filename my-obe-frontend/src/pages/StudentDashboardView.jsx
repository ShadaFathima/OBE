import React from "react";
import "./StudentDashboardView.css";
import { useLocation, Link } from "react-router-dom";
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
  Legend,
} from "recharts";

const lineData = [
  { name: "Figma", 2020: 50, 2021: 70, 2022: 90 },
  { name: "Sketch", 2020: 30, 2021: 80, 2022: 60 },
  { name: "XD", 2020: 70, 2021: 60, 2022: 95 },
];

const barData = [
  { name: "Figma", value: 80 },
  { name: "Sketch", value: 60 },
  { name: "XD", value: 90 },
];

const scores = [80, 75, 88, 63, 91];
const averageScore = 79; // Use this in the circle

const StudentDashboardView = () => {
  const location = useLocation();

  // Calculate circumference for r=90
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - averageScore) / 100) * circumference;

  return (
    <div className="student-container">
      <div className="sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <Link to="/studentdashboard">
              <MdManageAccounts className="icon" /> Profile
            </Link>
          </li>
          <li className="active">
            <MdDashboard className="icon" /> Dashboard
          </li>
          <li>
            <Link to="/studentperformance">
              <BiBadgeCheck className="icon" /> Performance
            </Link>
          </li>
          <li>
            <Link to="/studentlogin">
              <RiLogoutBoxRLine className="icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="dashboard-container">

          <div className="chart-section">
            <div className="chart-box">
              <h3>CO Performance</h3>
              <LineChart width={400} height={250} data={lineData}>
                <Line type="monotone" dataKey="2020" stroke="#8884d8" />
                <Line type="monotone" dataKey="2021" stroke="#82ca9d" />
                <Line type="monotone" dataKey="2022" stroke="#ffc658" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </div>

            <div className="chart-box">
              <h3>CO Graph</h3>
              <BarChart width={300} height={250} data={barData}>
                <Bar dataKey="value">
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#8979FF', '#6EC6FF', '#FFD166'][index % 3]}
                    />
                  ))}
                </Bar>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
              </BarChart>
            </div>
          </div>

          {/* Score + Average Row */}
          <div className="score-average-row">
            <div className="score-section">
              <h3>Score</h3>
              <div className="score-cards">
                {scores.map((score, index) => (
                  <div key={index} className="score-card">
                    <div>{score}</div>
                    <small>CO{index + 1}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="average-box">
              <h3>Average</h3>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Background Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#e6e6e6"
                  strokeWidth="15"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#ff6b6b"
                  strokeWidth="15"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
                {/* Text in center */}
                <text
                  x="100"
                  y="115"
                  textAnchor="middle"
                  fontSize="48"
                  fill="#333"
                  fontWeight="bold"
                >
                  {averageScore}%
                </text>
              </svg>
            </div>
          </div>

          <div className="feedback-box">
            <h3>Feedback</h3>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView;
