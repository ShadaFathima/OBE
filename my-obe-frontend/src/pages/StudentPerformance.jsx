import React, { useEffect } from "react";
import "./StudentPerformance.css";
import { useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

const StudentPerformance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Safely extract state or assign defaults
  const weakCOs = location.state?.weakCOs || [];
  const suggestions = location.state?.suggestions || {};
  const registerNumber = location.state?.registerNumber || '';
  const course = location.state?.course || '';
  const exam = location.state?.exam || '';

  useEffect(() => {
    if (!registerNumber || !course || !exam) {
      navigate("/studentexamcourseselect");
    }
  }, [registerNumber, course, exam, navigate]);

  return (
    <div className="stud-perf-student-container">
      <StudentSidebar
        registerNumber={registerNumber}
        course={course}
        exam={exam}
        resultData={{ weak_cos: weakCOs, suggestions }}
      />

      <div className="stud-perf-main-content">
        <h2 className="stud-perf-title">Suggestions to Improve your Performance</h2>

        <div className="stud-perf-section">
          <h3>Videos</h3>

          <div className="stud-perf-video-thumbnails">
            {weakCOs.length > 0 ? (
              weakCOs.flatMap((co, index) =>
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
              )
            ) : (
              <p>You are good to GO! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
