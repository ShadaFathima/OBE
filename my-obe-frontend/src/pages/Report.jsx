import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import {
  BarChart, Bar, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from "recharts";
import { useLocation } from "react-router-dom";
import "./Report.css";

const Report = () => {
  const { state } = useLocation();
  const course = state?.course;
  const exam = state?.exam;

  const [students, setStudents] = useState([]);
  const [coAverages, setCoAverages] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    if (!course || !exam) return;

    const fetchData = async () => {
      try {
        const [classRes, studentRes] = await Promise.all([
          axios.get("http://localhost:8000/api/class_performance/", { params: { course, exam } }),
          axios.get("http://localhost:8000/api/class/co_attainment/", { params: { course, exam } }),
        ]);

        const classData = classRes.data;
        const studentsRaw = studentRes.data;

        const averages = ["co1_avg", "co2_avg", "co3_avg", "co4_avg", "co5_avg", "co6_avg"]
          .map((key, i) => ({
            co: `CO${i + 1}`,
            average: parseFloat((classData[key] || 0).toFixed(2))
          }));
        setCoAverages(averages);

        const detailedStudents = await Promise.all(
          studentsRaw.map(async (s) => {
            try {
              const resultRes = await axios.get(`http://localhost:8000/api/results/${s.register_number}`, {
                params: { course, exam },
              });
              const result = resultRes.data;

              return {
                name: s.register_number,
                co_scores: Array.from({ length: 6 }, (_, i) => {
                  const val = parseFloat((s[`co${i + 1}`] || 0).toFixed(2));
                  return {
                    total: val,
                    int: parseFloat((val * 0.3).toFixed(2)),
                    ext: parseFloat((val * 0.7).toFixed(2)),
                  };
                }),
                percentage: parseFloat((result.percentage || 0).toFixed(2)),
                performance: result.performance || "N/A",
              };
            } catch {
              return {
                name: s.register_number,
                co_scores: Array.from({ length: 6 }, (_, i) => ({
                  total: parseFloat((s[`co${i + 1}`] || 0).toFixed(2)),
                  int: 0,
                  ext: 0,
                })),
                percentage: 0,
                performance: "N/A",
              };
            }
          })
        );

        setStudents(detailedStudents);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };

    fetchData();
  }, [course, exam]);

  const barData = coAverages.map(a => ({ name: a.co, value: a.average }));

  const handleDownload = async () => {
    const pdf = new jsPDF("p", "pt", "a4");
    const padding = 20;
    const pageWidth = pdf.internal.pageSize.getWidth() - 2 * padding;

    const pages = document.querySelectorAll(".pdf-page");

    for (let i = 0; i < pages.length; i++) {
      const element = pages[i];
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", padding, padding, pageWidth, pdfHeight);
    }

    pdf.save("CO_Attainment_Report.pdf");
  };

  return (
    <div className="report-container">
      <button className="report-button" onClick={handleDownload}>
        Download PDF
      </button>

      <div ref={reportRef}>
        {/* Overview Page */}
        <div className="pdf-page" style={{ padding: "40px", backgroundColor: "#fff" }}>
          <h1>{course}</h1>
          <h2>CO Attainment Report</h2>
          <h4>Exam: {exam}</h4>

          <div className="stud-result-table" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>SI.NO</th>
                  <th>REG NO</th>
                  {[...Array(6)].map((_, i) => (
                    <th key={i}>CO{i + 1}</th>
                  ))}
                  <th>PERCENTAGE</th>
                  <th>PERFORMANCE</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.name}</td>
                    {s.co_scores.map((co, j) => (
                      <td key={j}>{co.total.toFixed(2)}</td>
                    ))}
                    <td>{s.percentage.toFixed(2)}</td>
                    <td className={`performance-cell performance-${s.performance}`}>
                      {s.performance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h1 style={{ textAlign: "center", marginTop: "5rem", fontSize: '32px' }}>Class CO Averages</h1>
          <div className="chart-section">
            <BarChart width={600} height={400} data={barData}>
              <defs>
                <linearGradient id="co6Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd1dd" />
                  <stop offset="100%" stopColor="#aa0f80" />
                </linearGradient>
              </defs>
              <Bar dataKey="value">
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill="url(#co6Gradient)" />
                ))}
              </Bar>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => value.toFixed(2)} />
            </BarChart>
          </div>
        </div>


        {/* Per-Student Graphs - 12 per page */}
        <div className="stud-graph-container">

          {Array.from({ length: Math.ceil(students.length / 18) }, (_, pageIdx) => (
            <div className="pdf-page" key={pageIdx} style={{ padding: "30px", backgroundColor: "#fff" }}>
              <h2 style={{ textAlign: "center", backgroundColor: 'white' , marginBottom:'5rem',fontSize:'32px' }}>
            Student-Wise CO Performance
          </h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                {students.slice(pageIdx * 18, pageIdx * 18 + 18).map((s, idx) => {
                  const data = s.co_scores.map((co, i) => ({
                    co: `CO${i + 1}`,
                    student: co.total,
                    classAvg: coAverages[i]?.average || 0,
                  }));

                  return (
                    <div key={idx} style={{ flex: "0 0 30%" }}>
                      <ComposedChart width={350} height={280} data={data}>
                        <defs>
                          <linearGradient id="co6Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffd1dd" />
                            <stop offset="100%" stopColor="#aa0f80" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="co" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => value.toFixed(2)} />
                        <Bar dataKey="student">
                          {data.map((_, barIdx) => (
                            <Cell key={barIdx} fill="url(#co6Gradient)" />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="classAvg" stroke="#af0000" dot />
                      </ComposedChart>
                      <h4 style={{ textAlign: "center", fontSize: "12px", marginTop: "4px" }}>{s.name}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;
