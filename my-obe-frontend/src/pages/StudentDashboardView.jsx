import React, { useEffect, useState } from "react";
import "./StudentDashboardView.css";
import { useParams, Link, NavLink } from "react-router-dom";
import { MdManageAccounts, MdDashboard } from "react-icons/md";
import { BiBadgeCheck } from "react-icons/bi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import StudentSidebar from "../components/StudentSidebar";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
  Bar,
  Cell,
} from "recharts";

const StudentDashboardView = () => {
  const { registerNumber, exam, course } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [classPerformance, setClassPerformance] = useState(null);
  const [coDefinitions, setCoDefinitions] = useState({});
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    if (!registerNumber) {
      setError("No register number provided");
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      try {
        const [
          resultRes,
          detailsRes,
          classRes,
          coMapRes,
          historyRes,
        ] = await Promise.all([
          fetch(`http://localhost:8000/api/results/${registerNumber}?exam=${exam}&course=${course}`),
          fetch(`http://localhost:8000/api/student_details/${registerNumber}?exam=${exam}&course=${course}`),
          fetch(`http://localhost:8000/api/class_performance/?exam=${encodeURIComponent(exam)}&course=${encodeURIComponent(course)}`),
          fetch(`http://localhost:8000/api/co-mapping/?exam=${exam}&course=${course}`),
          fetch(`http://localhost:8000/api/student/performance/?register_number=${registerNumber}&course=${course}`),
        ]);

        if (!resultRes.ok || !detailsRes.ok || !coMapRes.ok || !historyRes.ok) {
          throw new Error("Failed to fetch student, CO mapping or history data");
        }

        if (classRes.ok) setClassPerformance(await classRes.json());

        const [resultData, studentDetails, coMapData, historyJson] = await Promise.all([
          resultRes.json(),
          detailsRes.json(),
          coMapRes.json(),
          historyRes.json()
        ]);

        setResultData(resultData);
        setStudentDetails(studentDetails);
        setCoDefinitions(coMapData?.co_definition || {});
        setHistoryData(historyJson);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [registerNumber, exam, course]);

  if (loading) return <div>Loading student data...</div>;
  if (error) return <div>Error: {error}</div>;

  const coScores = Array.from({ length: 6 }, (_, i) => {
    const coIndex = i + 1;
    return {
      name: `CO${coIndex}`,
      score: studentDetails?.[`co${coIndex}`] || 0,
      description:
        resultData?.suggestions?.[`CO${coIndex}`]?.definition ||
        coDefinitions?.[`CO${coIndex}`] ||
        "No description available",
      classAvg: classPerformance?.[`co${coIndex}_avg`] || 0,
    };
  });

  const averageScore = resultData?.percentage || 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - averageScore) / 100) * circumference;

  const lineData = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"].map((coLabel, idx) => {
    const coKey = `co${idx + 1}`;
    const row = { name: coLabel };
    historyData.forEach(examItem => {
      row[examItem.exam] = examItem[coKey] || 0;
    });
    return row;
  });


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

  return (
    <div className="stud-dash-view-student-container">
      <StudentSidebar
        registerNumber={registerNumber}
        course={course}
        exam={exam}
        resultData={resultData}
      />

      <div className="stud-dash-view-main-content">
        <div className="stud-dash-view-dashboard">
          <div className="stud-dash-view-chart-section">
            {lineData.length > 0 && (
              <div className="stud-dash-view-chart-box">
                <h3>Exam-wise CO Trend</h3>
                <LineChart width={450} height={250} data={lineData}>
                  {historyData.map((examItem, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={examItem.exam}
                      stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bcd4", "#c2185b"][index % 6]}
                      strokeWidth={1}
                      dot={{ r: 3 }}
                    />
                  ))}
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </div>
            )}


            <div className="stud-dash-view-chart-box">
              <h3>Performance deviation from Class Average</h3>
              <ComposedChart width={400} height={250} data={coScores}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score">
                  {coScores.map((_, i) => (
                    <Cell key={i} fill={`url(#coGradient${(i % 6) + 1})`} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="classAvg"
                  stroke="#af0000"
                  strokeWidth={1}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </ComposedChart>
              <svg style={{ height: 0 }}>
                <defs>
                  {["#b8aaff", "#ffc2c2", "#a0ecff", "#ffe299", "#b0ccff", "#ff4fff"].map(
                    (startColor, idx) => {
                      const endColors = [
                        "#8979ff", "#ff8c8c", "#6ec6ff", "#ffd166", "#80aaff", "#aa0f80"
                      ];
                      return (
                        <linearGradient key={idx} id={`coGradient${idx + 1}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={startColor} />
                          <stop offset="100%" stopColor={endColors[idx]} />
                        </linearGradient>
                      );
                    }
                  )}
                </defs>
              </svg>
            </div>
          </div>

          <div className="stud-dash-view-score-average-row">
            <div className="stud-dash-view-score-feed-container">
              <div className="stud-dash-view-score-section">
                <h3>Score</h3>
                <div className="stud-dash-view-score-cards">
                  {coScores.map((co, index) => (
                    <div key={index} className="stud-dash-view-score-card-with-tooltip">
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
                  <span style={{ color: "rgb(255, 133, 133)", fontWeight: "600", fontSize: "1.1rem" }}>
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
                  <circle cx="100" cy="100" r={radius} stroke="#e6e6e6" strokeWidth="15" fill="none" />
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

          {lineData.length > 0 && (
            <div className="stud-dash-view-chart-box">
              <h3>Exam-wise CO Trend</h3>
              <LineChart width={800} height={300} data={lineData}>
                {historyData.map((exam, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={exam.exam}
                    stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bcd4"][i % 5]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView;
