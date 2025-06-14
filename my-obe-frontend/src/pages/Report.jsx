// COAttainmentReport.jsx
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
} from "recharts";
import "./Report.css";

const Report = () => {
  const [students, setStudents] = useState([]);
  const reportRef = useRef();

  const mockStudents = [
    {
      name: "Alice",
      co_scores: [
        { int: 12, ext: 16, total: 28 },
        { int: 14, ext: 15, total: 29 },
        { int: 10, ext: 18, total: 28 },
        { int: 13, ext: 14, total: 27 },
        { int: 15, ext: 12, total: 27 },
        { int: 11, ext: 17, total: 28 },
      ],
    },
    {
      name: "Joe",
      co_scores: [
        { int: 12, ext: 16, total: 28 },
        { int: 14, ext: 15, total: 29 },
        { int: 10, ext: 18, total: 28 },
        { int: 13, ext: 14, total: 27 },
        { int: 15, ext: 12, total: 27 },
        { int: 11, ext: 17, total: 28 },
      ],
    },
    {
      name: "Steve",
      co_scores: [
        { int: 12, ext: 16, total: 28 },
        { int: 14, ext: 15, total: 29 },
        { int: 10, ext: 18, total: 28 },
        { int: 13, ext: 14, total: 27 },
        { int: 15, ext: 12, total: 27 },
        { int: 11, ext: 17, total: 28 },
      ],
    },
    {
      name: "Shine",
      co_scores: [
        { int: 12, ext: 16, total: 28 },
        { int: 14, ext: 15, total: 29 },
        { int: 10, ext: 18, total: 28 },
        { int: 13, ext: 14, total: 27 },
        { int: 15, ext: 12, total: 27 },
        { int: 11, ext: 17, total: 28 },
      ],
    },
    {
      name: "Bob",
      co_scores: [
        { int: 10, ext: 15, total: 25 },
        { int: 12, ext: 14, total: 26 },
        { int: 11, ext: 13, total: 24 },
        { int: 13, ext: 12, total: 25 },
        { int: 14, ext: 15, total: 29 },
        { int: 12, ext: 13, total: 25 },
      ],
    },
  ];

  useEffect(() => {
    setStudents(mockStudents);
  }, []);

  const handleDownload = () => {
    const input = reportRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("CO_Attainment_Report.pdf");
    });
  };

  const coAverages = Array.from({ length: 6 }, (_, i) => {
    const total = students.reduce((sum, student) => sum + student.co_scores[i].total, 0);
    const avg = total / students.length;
    return { co: `CO${i + 1}`, average: parseFloat(avg.toFixed(2)) };
  });

  return (
    <div className="report-container">
      <h1>Farook College (Autonomous)</h1>
      <div className="report-header">
        <h2>CO Attainment Report</h2>
        <button className="report-button" onClick={handleDownload}>
          Download PDF
        </button>
      </div>

      <div ref={reportRef} className="report-table">
        <p><strong>Course:</strong> Sample Course</p>
        <h4><em>Average Attainment</em></h4>

        <table>
          <thead>
            <tr>
              <th rowSpan="2">S.No</th>
              <th rowSpan="2">Student</th>
              {Array.from({ length: 6 }).map((_, i) => (
                <th colSpan="3" key={i}>CO{i + 1}</th>
              ))}
              <th rowSpan="2">Average</th>
            </tr>
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <th>INT</th>
                  <th>EXT</th>
                  <th>Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const totalSum = student.co_scores.reduce((sum, co) => sum + co.total, 0);
              const average = (totalSum / student.co_scores.length).toFixed(2);
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  {student.co_scores.map((co, idx) => (
                    <React.Fragment key={idx}>
                      <td>{co.int}</td>
                      <td>{co.ext}</td>
                      <td>{co.total}</td>
                    </React.Fragment>
                  ))}
                  <td><strong>{average}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ✅ Class-wise Average CO Chart */}
        <div className="chart-section">
          <h3>Average CO Attainment of the Class</h3>
          <ResponsiveContainer width="50%" height={300}>
            <BarChart data={coAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="co" label={{ value: "Course Outcomes (CO)", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Average Attainment", angle: -90, position: "insideLeft" }} domain={[0, 30]} />
              <Tooltip />
              <Bar dataKey="average" fill="#e4d5f2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Student-wise CO Attainment Charts */}
        <div className="chart-section">
          <h3>Student wise CO Attainment</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px" }}>
            {students.map((student, index) => {
              const studentData = student.co_scores.map((co, i) => ({
                co: `CO${i + 1}`,
                student: co.total,
                average: coAverages[i].average,
              }));

              return (
                <div key={index} style={{ width: "400px", height: "300px" }}>
                  <h4 style={{ textAlign: "center", fontSize: "14px", marginBottom: "5px" }}>
                    Student Wise CO Attainment for {student.name}
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="co" />
                      <YAxis domain={[0, 30]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" fill="#e4d5f2" name="Class Average" />
                      <Bar dataKey="student" fill="#f2789f" name="Student Attainment" />
                      <Line type="monotone" dataKey="student" stroke="#000" dot />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
