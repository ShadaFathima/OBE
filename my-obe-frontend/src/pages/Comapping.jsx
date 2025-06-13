import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [mappingErrors, setMappingErrors] = useState({});
  const [definitionErrors, setDefinitionErrors] = useState(Array(6).fill(false));

  const navigate = useNavigate();
  const markInputRefs = useRef([]);
  const coInputRefs = useRef([]);

  const totalQuestions =
    sectionRows[courseType].section1 +
    sectionRows[courseType].section2 +
    sectionRows[courseType].section3;

  useEffect(() => {
    markInputRefs.current = Array(totalQuestions)
      .fill()
      .map((_, i) => markInputRefs.current[i] || React.createRef());
  }, [courseType]);

  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  const handleCoChange = (index, value) => {
    const updated = [...coDefinitions];
    updated[index] = value;
    setCoDefinitions(updated);
  };

  const handleMarkBlur = (index) => {
    const value = markInputRefs.current[index]?.value?.trim();
    setMappingErrors((prev) => {
      const newErrors = { ...prev };
      if (!value) {
        newErrors[index] = true;
      } else {
        delete newErrors[index];
      }
      return newErrors;
    });
  };

  const handleDefinitionBlur = (index) => {
    const value = coDefinitions[index]?.trim();
    setDefinitionErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = !value;
      return newErrors;
    });
  };

  const handleDoneClick = async () => {
    if (!courseName.trim() || !examName.trim()) {
      alert('Please enter both course name and exam name.');
      return;
    }

    const questionToCO = {};
    const mappingErrs = {};
    const coDefsErrs = Array(6).fill(false);

    markInputRefs.current.forEach((ref, index) => {
      const value = ref?.value?.trim();
      if (!value) {
        mappingErrs[index] = true;
      } else {
        questionToCO[`Q${index + 1}`] = value.toUpperCase();
      }
    });

    coDefinitions.forEach((def, idx) => {
      if (!def.trim()) {
        coDefsErrs[idx] = true;
      }
    });

    setMappingErrors(mappingErrs);
    setDefinitionErrors(coDefsErrs);

    if (Object.keys(mappingErrs).length > 0 || coDefsErrs.includes(true)) {
      alert('Please fill all CO Mappings and CO Definitions.');
      return;
    }

    const coDefsJson = {};
    coDefinitions.forEach((def, idx) => {
      coDefsJson[`CO${idx + 1}`] = def.trim();
    });

    const payload = {
      course: courseName,
      exam: examName,
      question_to_co: questionToCO,
      co_definition: coDefsJson,
    };

    try {
      await axios.post("http://localhost:8000/api/co-mapping/", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      alert('Mapping and definitions saved successfully!');
      navigate('/individualupload', {
        state: {
          courseName,
          examName,
          courseType,
          coDefinitions,
          questionToCO,
        },
      });
    } catch (error) {
      if (error.response) {
        console.error("422 Error details:", error.response.data);
        alert("Error: " + JSON.stringify(error.response.data.detail));
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  const handleMarkKeyDown = (e, index) => {
    if (e.key === 'Enter' && index < totalQuestions - 1) {
      e.preventDefault();
      markInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCoKeyDown = (e, index) => {
    if (e.key === 'Enter' && index < coDefinitions.length - 1) {
      e.preventDefault();
      coInputRefs.current[index + 1]?.focus();
    }
  };

  const renderSection = (title, rows, startQNo) => (
    <div className="Comapping-section" key={title}>
      <h4>{title}</h4>
      {Array.from({ length: rows }).map((_, i) => {
        const qNo = startQNo + i;
        return (
          <div className="Comapping-input-row" key={qNo}>
            <label>{`Q${qNo}`}</label>
            <input
              type="text"
              ref={(el) => (markInputRefs.current[qNo - 1] = el)}
              onKeyDown={(e) => handleMarkKeyDown(e, qNo - 1)}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
              onBlur={() => handleMarkBlur(qNo - 1)}
              placeholder={`CO for Q${qNo}`}
              className={mappingErrors[qNo - 1] ? 'input-error' : ''}
            />
          </div>
        );
      })}
    </div>
  );

  const section1Count = sectionRows[courseType].section1;
  const section2Count = sectionRows[courseType].section2;
  const section3Count = sectionRows[courseType].section3;

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
          <div className="Comapping-left">
            <h2 className="comap-heading">CO Mapping</h2>
            <div className="Comapping-student-entry-sections">
              {renderSection('Section 1', section1Count, 1)}
              {renderSection('Section 2', section2Count, section1Count + 1)}
              {renderSection('Section 3', section3Count, section1Count + section2Count + 1)}
            </div>
          </div>

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
                    onKeyDown={(e) => handleCoKeyDown(e, i)}
                    onBlur={() => handleDefinitionBlur(i)}
                    ref={(el) => (coInputRefs.current[i] = el)}
                    placeholder={`Enter CO${i + 1} Definition`}
                    className={definitionErrors[i] ? 'input-error' : ''}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="Comapping-student-entry-buttons">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="Comapping-done-btn" onClick={() => navigate(-1)}>
              BACK
            </button>
            <button className="Comapping-done-btn" onClick={handleDoneClick}>
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comapping;
