import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TeacherDashboard.css';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";

const lineData = [
  { name: 'Figma', 2020: 60, 2021: 70, 2022: 85 },
  { name: 'Sketch', 2020: 30, 2021: 60, 2022: 80 },
  { name: 'XD', 2020: 50, 2021: 65, 2022: 90 },
  { name: 'PS', 2020: 45, 2021: 60, 2022: 88 },
  { name: 'AI', 2020: 40, 2021: 50, 2022: 72 },
];

const barData = [
  { name: 'Figma', 2020: 80 },
  { name: 'Sketch', 2020: 70 },
  { name: 'XD', 2020: 60 },
  { name: 'PS', 2020: 90 },
  { name: 'AI', 2020: 75 },
];

const TeacherDashboard = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData([
      { id: 1, subject: 'Math', co1: 80, co2: 75, co3: 85 },
      { id: 2, subject: 'Physics', co1: 70, co2: 78, co3: 80 },
      { id: 3, subject: 'CS', co1: 85, co2: 80, co3: 90 },
    ]);
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>TrackMyCO</h2>
        <ul>
          <li>
            <Link to="/teacherprofile">
              <MdManageAccounts className="icon" /> Profile
            </Link>
          </li>

          <li className="active">
              <MdDashboard className="icon" /> Dashboard

          </li>

          <li>
            <Link to="/teacherenhancement">
            <BiBadgeCheck className="icon" /> Enhancement
            </Link>
          </li>

          <li>
            <Link to="/teacherlogin">
              <RiLogoutBoxRLine className="icon" /> Logout
            </Link>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="charts">
          <div className="chart-box">
            <h3>CO Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="2020" stroke="#8884d8" />
                <Line type="monotone" dataKey="2021" stroke="#82ca9d" />
                <Line type="monotone" dataKey="2022" stroke="#ff82a9" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>CO Graph</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="2020" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cards">
          <div className="card">80<br /><span>Excellent</span></div>
          <div className="card">75<br /><span>Average</span></div>
          <div className="card">88<br /><span>Below Average</span></div>
          <div className="card">63<br /><span>At-risk</span></div>
        </div>

        <div className="bottom-section">
          <div className="table-box">
            <h3>Student CO Table</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>CO1</th>
                  <th>CO2</th>
                  <th>CO3</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.subject}</td>
                    <td>{row.co1}</td>
                    <td>{row.co2}</td>
                    <td>{row.co3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
<div className="progress-circle">
  <h3>Average</h3>
  <svg width="160" height="160">
    <circle
      cx="80"
      cy="80"
      r="65"
      stroke="#e6e6e6"
      strokeWidth="10"
      fill="none"
    />
    <circle
      cx="80"
      cy="80"
      r="65"
      stroke="#ff6b6b"
      strokeWidth="10"
      fill="none"
      strokeDasharray={`${(80 / 100) * (2 * Math.PI * 65)}, 408`}
      strokeLinecap="round"
      transform="rotate(-90 80 80)"
    />
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24">80%</text>
  </svg>
</div>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
