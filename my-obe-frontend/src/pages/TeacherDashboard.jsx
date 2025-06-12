import React from "react";
import "./TeacherDashboard.css";
import { useLocation, NavLink, Link } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { RiUpload2Line } from "react-icons/ri";


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

// Custom Cube Bar Shape
const renderCubeBar = (props) => {
  const { x, y, width, height, fill } = props;
  const depth = 10;

  return (
    <g>
      {/* Front face */}
      <rect x={x} y={y} width={width} height={height} fill={fill} />

      {/* Top face */}
      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width + depth},${y - depth}
          ${x + width},${y}
        `}
        fill={shadeColor(fill, -10)}
      />

      {/* Side face */}
      <polygon
        points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
        fill={shadeColor(fill, -20)}
      />
    </g>
  );
};

function shadeColor(color, percent) {
  let f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

// Chart & Score Data
const lineData = [
  { name: "Figma", 2020: 50, 2021: 70, 2022: 90 },
  { name: "Sketch", 2020: 30, 2021: 80, 2022: 60 },
  { name: "XD", 2020: 70, 2021: 60, 2022: 95 },
  { name: "Adobe", 2020: 60, 2021: 90, 2022: 80 },
  { name: "InVision", 2020: 40, 2021: 50, 2022: 70 },
];
const barData = [
  { name: "Figma", value: 70 },
  { name: "Sketch", value: 50 },
  { name: "XD", value: 80 },
  { name: "PS", value: 60 },
  { name: "AI", value: 90 },
];

const scores = [80, 75, 88, 63, 91];
const averageScore = 79;

const TeacherDashboard = () => {
  const location = useLocation();

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - averageScore) / 100) * circumference;

  return (
    <div className="teac-dash-student-container">
      <div className="teac-dash-sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <NavLink to="/uploadfirstpage" >
              <RiUpload2Line className="icon" /> Upload
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherdashboard" className="active">
              <MdDashboard className="icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/teacherlogin" >
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
                <Line type="monotone" dataKey="2020" stroke="#8884d8" />
                <Line type="monotone" dataKey="2021" stroke="#82ca9d" />
                <Line type="monotone" dataKey="2022" stroke="#ffc658" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </div>

            <div className="teac-dash-chart-box">
              <h3>CO Graph</h3>
              <BarChart width={400} height={250} data={barData}>
                <defs>
                  <linearGradient id="figmaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b8aaff" />
                    <stop offset="100%" stopColor="#8979ff" />
                  </linearGradient>
                  <linearGradient id="sketchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffc2c2" />
                    <stop offset="100%" stopColor="#ff8c8c" />
                  </linearGradient>
                  <linearGradient id="xdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0ecff" />
                    <stop offset="100%" stopColor="#6ec6ff" />
                  </linearGradient>
                  <linearGradient id="psGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffe299" />
                    <stop offset="100%" stopColor="#ffd166" />
                  </linearGradient>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b0ccff" />
                    <stop offset="100%" stopColor="#80aaff" />
                  </linearGradient>
                </defs>

                <Bar dataKey="value">
                  {barData.map((entry, index) => {
                    const gradients = [
                      "figmaGradient",
                      "sketchGradient",
                      "xdGradient",
                      "psGradient",
                      "aiGradient",
                    ];
                    return (
                      <Cell key={`cell-${index}`} fill={`url(#${gradients[index % 5]})`} />
                    );
                  })}
                </Bar>

                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend
                  payload={[
                    { value: "Figma", type: "square", color: "#8979ff" },
                    { value: "Sketch", type: "square", color: "#ff8c8c" },
                    { value: "XD", type: "square", color: "#6ec6ff" },
                    { value: "PS", type: "square", color: "#ffd166" },
                    { value: "AI", type: "square", color: "#80aaff" },
                  ]}
                />
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
                      <div>{score}</div>
                      <small>CO{index + 1}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="teac-dash-feedback-box">
                <h3>Feedback</h3>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry...
                </p>
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
                    fill="rgba(255, 146, 133, 0.7)"
                    fontWeight="light"
                  >
                    {averageScore}%
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
