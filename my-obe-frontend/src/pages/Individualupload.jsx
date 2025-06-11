import React, { useState, useRef } from 'react';
import './Individualupload.css';

const sectionRows = {
  Major: { section1: 10, section2: 8, section3: 2 },
  Minor: { section1: 10, section2: 5, section3: 2 }
};

const sectionMarks = {
  Major: {
    section1: { min: 0, max: 3 },
    section2: { min: 0, max: 6 },
    section3: { min: 0, max: 10 }
  },
  Minor: {
    section1: { min: 0, max: 2 },
    section2: { min: 0, max: 6 },
    section3: { min: 0, max: 10 }
  }
};

const Individualupload = () => {
  const [courseType, setCourseType] = useState('Major');
  const [registerNumber, setRegisterNumber] = useState('');
  const [marks, setMarks] = useState({});
  const inputRefs = useRef([]);

  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  const handleMarkChange = (index, value) => {
    setMarks((prev) => ({ ...prev, [index]: value }));
  };

  const handleAdd = () => {
    console.log("Saving Data:", { courseType, registerNumber, marks });

    // Reset only register number and marks
    setRegisterNumber('');
    setMarks({});
  };

  // Reset ref array each render
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

  const section1Rows = sectionRows[courseType].section1;
  const section2Rows = sectionRows[courseType].section2;
  const section3Rows = sectionRows[courseType].section3;

  let qNo = 1;
  let inputIndex = 0;

  return (
    <div className="Individualupload-student-entry-container">
      <h2>STUDENT-WISE MARK ENTRY</h2>

      <div className="Individualupload-student-entry-fields">
        <div>
          <label>Course</label>
          <input type="text" placeholder="STA1FM102 - Fundamentals of Statistics" disabled />
        </div>
        <div>
          <label>Exam Name</label>
          <input type="text" placeholder="Enter exam name" disabled />
        </div>

        <div className="Individualupload-student-entry-dropdown">
          <label>Course Type:</label>
          <select value={courseType} onChange={handleCourseTypeChange}>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      <hr />
      <div className="main-input">
        <div className="Individual-upload-regno">
          <label>Register Number:</label>
          <input
            type="text"
            placeholder="Enter register number"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
          />
        </div>

        <div className="Individualupload-student-entry-sections">
          {renderSection("Section 1", section1Rows, "section1", courseType, qNo, inputIndex)}
          {(() => { qNo += section1Rows; inputIndex += section1Rows; return null; })()}
          {renderSection("Section 2", section2Rows, "section2", courseType, qNo, inputIndex)}
          {(() => { qNo += section2Rows; inputIndex += section2Rows; return null; })()}
          {renderSection("Section 3", section3Rows, "section3", courseType, qNo, inputIndex)}
        </div>

        <div className="Individualupload-student-entry-buttons">
          <button className="Individualupload-add-btn" onClick={handleAdd}>ADD ＋</button>
          <button className="Individualupload-done-btn">DONE</button>
        </div>
      </div>
    </div>
  );
};

export default Individualupload;
