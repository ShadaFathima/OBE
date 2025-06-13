import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Individualupload.css';

const sectionRows = {
  Major: { section1: 10, section2: 8, section3: 2 },
  Minor: { section1: 10, section2: 5, section3: 2 },
};

const sectionMarks = {
  Major: {
    section1: { min: 0, max: 3 },
    section2: { min: 0, max: 6 },
    section3: { min: 0, max: 10 },
  },
  Minor: {
    section1: { min: 0, max: 2 },
    section2: { min: 0, max: 6 },
    section3: { min: 0, max: 10 },
  },
};

const Individualupload = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ FIXED: this was missing in your original code

  const {
    courseName = '',
    examName = '',
    courseType: selectedCourseType = 'Major',
    coDefinitions = [],
    questionToCO = {},
  } = location.state || {};

  const [registerNumber, setRegisterNumber] = useState('');
  const [marks, setMarks] = useState({});
  const inputRefs = useRef([]);

  const totalQuestions =
    sectionRows[selectedCourseType].section1 +
    sectionRows[selectedCourseType].section2 +
    sectionRows[selectedCourseType].section3;

  const handleMarkChange = (index, value) => {
    setMarks((prev) => ({ ...prev, [index]: value }));
  };

  const handleAdd = async () => {
    if (!registerNumber.trim()) {
      alert("Register Number is required.");
      return;
    }

    for (let i = 0; i < totalQuestions; i++) {
      if (marks[i] === undefined || marks[i] === '') {
        alert(`Please enter mark for Question ${i + 1}.`);
        return;
      }
    }

    const formattedMarks = {};
    Object.entries(marks).forEach(([index, value]) => {
      formattedMarks[`Q${parseInt(index) + 1}`] = Number(value);
    });

    const coDefinitionsObject = {};
    coDefinitions.forEach((def, index) => {
      coDefinitionsObject[`CO${index + 1}`] = def;
    });

    const payload = {
      course: courseName,
      exam: examName,
      course_type: selectedCourseType,
      register_number: registerNumber.trim(),
      marks: formattedMarks,
      question_to_co: questionToCO,
      co_definitions: coDefinitionsObject,
    };

    console.log("Saving Data:", payload);

    try {
      const response = await fetch("http://localhost:8000/api/analyze_individual/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
        return;
      }

      const result = await response.json();
      console.log("Result from backend:", result);

      setRegisterNumber('');
      setMarks({});
    } catch (error) {
      console.error("Error while sending data:", error);
      alert("Something went wrong while saving data.");
    }
  };

  inputRefs.current = [];

  const renderSection = (title, rows, sectionKey, courseType, startQno, startIndex) => {
    const { min, max } = sectionMarks[courseType][sectionKey];
    return (
      <div className="Individualupload-section">
        <h4>{title}</h4>
        {Array.from({ length: rows }).map((_, i) => {
          const index = startIndex + i;
          return (
            <div className="Individualupload-input-row" key={i}>
              <label>{`Q${startQno + i}`}</label>
              <input
                type="number"
                min={min}
                max={max}
                value={marks[index] || ''}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleMarkChange(index, e.target.value)}
                onInput={(e) => {
                  const value = e.target.value;
                  if (value !== '') {
                    const num = Number(value);
                    if (num > max) {
                      alert(`Maximum mark for this question is ${max}`);
                      e.target.value = max;
                      handleMarkChange(index, max);
                    } else if (num < min) {
                      e.target.value = min;
                      handleMarkChange(index, min);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const nextInput = inputRefs.current[index + 1];
                    if (nextInput) nextInput.focus();
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const section1Rows = sectionRows[selectedCourseType].section1;
  const section2Rows = sectionRows[selectedCourseType].section2;
  const section3Rows = sectionRows[selectedCourseType].section3;

  let qNo = 1;
  let inputIndex = 0;

  return (
    <div className="Individualupload-student-entry-container">
      <h2>STUDENT-WISE MARK ENTRY</h2>

      <div className="Individualupload-student-entry-fields">
        <div>
          <label>Course</label>
          <input type="text" value={courseName} disabled />
        </div>
        <div>
          <label>Exam Name</label>
          <input type="text" value={examName} disabled />
        </div>

        <div className="Individualupload-student-entry-dropdown">
          <label>Course Type:</label>
          <select value={selectedCourseType} disabled>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      <hr />

      <div className="main-input">
        <div className="Individualupload-regno-actions-row">
          <div className="Individualupload-regno-box">
            <label>Register Number:</label>
            <input
              type="text"
              placeholder="Enter register number"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
            />
          </div>

          <div className="Individualupload-button-box">
            <button className="Individualupload-add-btn" onClick={handleAdd}>ADD ＋</button>
            <button className="Individualupload-done-btn" onClick={() => navigate('/uploadfirstpage')}>DONE</button>
          </div>
        </div>

        <div className="Individualupload-student-entry-sections">
          {renderSection("Section 1", section1Rows, "section1", selectedCourseType, qNo, inputIndex)}
          {(() => { qNo += section1Rows; inputIndex += section1Rows; return null; })()}
          {renderSection("Section 2", section2Rows, "section2", selectedCourseType, qNo, inputIndex)}
          {(() => { qNo += section2Rows; inputIndex += section2Rows; return null; })()}
          {renderSection("Section 3", section3Rows, "section3", selectedCourseType, qNo, inputIndex)}
        </div>
      </div>
    </div>
  );
};

export default Individualupload;
