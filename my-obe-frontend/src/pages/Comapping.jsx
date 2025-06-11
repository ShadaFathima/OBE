import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Comapping.css';

const sectionRows = {
  Major: { section1: 10, section2: 8, section3: 2 },
  Minor: { section1: 10, section2: 5, section3: 2 },
};

const Comapping = () => {
  const [courseType, setCourseType] = useState('Major');
  const [courseName, setCourseName] = useState('');
  const [examName, setExamName] = useState('');
  const [coDefinitions, setCoDefinitions] = useState(Array(6).fill(''));

  const navigate = useNavigate();

  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  const handleCoChange = (index, value) => {
    const updated = [...coDefinitions];
    updated[index] = value;
    setCoDefinitions(updated);
  };

  const handleDoneClick = () => {
    if (!courseName || !examName) {
      alert('Please enter both course name and exam name.');
      return;
    }

    navigate('/individualupload', {
      state: {
        courseName,
        examName,
        courseType,
        coDefinitions,
      },
    });
  };

  const renderSection = (title, rows) => (
    <div className="Comapping-section">
      <h4>{title}</h4>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="Comapping-input-row" key={i}>
          <label>{`Q${i + 1}`}</label>
          <input type="text" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="Comapping-student-entry-container">
      <h2>STUDENT-WISE MARK ENTRY</h2>

      <div className="Comapping-student-entry-fields">
        <div>
          <label>Course</label>
          <input
            type="text"
            placeholder="STA1FM102 - Fundamentals of Statistics"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>
        <div>
          <label>Exam Name</label>
          <input
            type="text"
            placeholder="Enter exam name"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
        </div>

        <div className="Comapping-student-entry-dropdown">
          <label>Course Type:</label>
          <select value={courseType} onChange={handleCourseTypeChange}>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      <div className="Comapping-main-input">
        <div className="Comapping-flex-container">
          {/* Left Side: CO Mapping */}
          <div className="Comapping-left">
            <h2 className="comap-heading">CO Mapping</h2>
            <div className="Comapping-student-entry-sections">
              {renderSection("Section 1", sectionRows[courseType].section1)}
              {renderSection("Section 2", sectionRows[courseType].section2)}
              {renderSection("Section 3", sectionRows[courseType].section3)}
            </div>
          </div>

          {/* Right Side: CO Definitions */}
          <div className="Comapping-right">
            <h2 className="codef-heading">CO Definitions</h2>
            <div className="Comapping-co-definitions">
              {coDefinitions.map((co, i) => (
                <div className="Comapping-co-box" key={i}>
                  <label>{`CO${i + 1}`}</label>
                  <input
                    type="text"
                    value={co}
                    onChange={(e) => handleCoChange(i, e.target.value)}
                    placeholder={`Enter CO${i + 1} Definition`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="Comapping-student-entry-buttons">
          <button className="Comapping-done-btn" onClick={handleDoneClick}>
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comapping;
