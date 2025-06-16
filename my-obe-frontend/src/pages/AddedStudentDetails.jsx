import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddedStudentDetails.css';

const AddedStudentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    course = '',
    exam = '',
    courseType = 'Major',
  } = location.state || {};

  const totalQuestions = courseType === 'Major' ? 20 : 17;
  const questionColumns = Array.from({ length: totalQuestions }, (_, i) => `Q${i + 1}`);

  const [students, setStudents] = useState(() => {
    const saved = sessionStorage.getItem('addedStudents');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedStudents, setSavedStudents] = useState(() => {
    const saved = sessionStorage.getItem('permanentStudents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('addedStudents', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    sessionStorage.setItem('permanentStudents', JSON.stringify(savedStudents));
  }, [savedStudents]);

  const handleEdit = (index) => {
    const student = students[index];
    navigate('/individualupload', {
      state: {
        courseName: course,
        examName: exam,
        courseType,
        studentToEdit: student,
      }
    });
  };

  const handleDelete = (index) => {
    const updated = [...students];
    updated.splice(index, 1);
    setStudents(updated);
  };

  const handleSave = (index) => {
    const student = students[index];
    const confirmSave = window.confirm(`Do you want to save ${student.registerNumber}'s details permanently?`);
    if (confirmSave) {
      setSavedStudents((prev) => [...prev, student]);
      setStudents((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDone = () => {
    alert("Saved students are locked and submitted.");
    sessionStorage.removeItem('addedStudents');
    // Optional: send savedStudents to backend here
    navigate('/uploadfirstpage');
  };

  return (
    <div className="added-details-container">
      <h2>ADDED STUDENT DETAILS</h2>
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <h3>{course} - {exam} ({courseType})</h3>

      <table className="added-students-table">
        <thead>
          <tr>
            <th>Register Number</th>
            {questionColumns.map((q) => <th key={q}>{q}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={questionColumns.length + 2} style={{ textAlign: 'center' }}>
                No unsaved students.
              </td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={index}>
                <td>{student.registerNumber}</td>
                {questionColumns.map((q) => (
                  <td key={q}>{student.marks?.[q] ?? ''}</td>
                ))}
                <td>
                  <button onClick={() => handleEdit(index)} className="action-btn edit-btn">Edit</button>
                  <button onClick={() => handleDelete(index)} className="action-btn delete-btn">Delete</button>
                  <button onClick={() => handleSave(index)} className="action-btn save-btn">Save</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {savedStudents.length > 0 && (
        <>
          <button className="done-btn" onClick={handleDone}>✅ DONE</button>

          <div className="saved-section">
            <h3>✔️ SAVED STUDENTS</h3>
            <p><strong>Course:</strong> {course}<strong> Exam:</strong> {exam}<strong>  Course Type:</strong> {courseType}</p>
            <table className="added-students-table">
              <thead>
                <tr>
                  <th>Register Number</th>
                  {questionColumns.map((q) => <th key={q}>{q}</th>)}
                </tr>
              </thead>
              <tbody>
                {savedStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.registerNumber}</td>
                    {questionColumns.map((q) => (
                      <td key={q}>{student.marks?.[q] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AddedStudentDetails;
