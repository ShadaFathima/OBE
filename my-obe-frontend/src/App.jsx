import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import TeacherLogin from './pages/TeacherLogin';
import Homepage from './pages/Homepage';
import StudentLogin from './pages/StudentLogin'; 
import StudentDashboard from './pages/StudentDashboard';
import StudentDashboardView from './pages/StudentDashboardView';
import StudentPerformance from './pages/StudentPerformance';
import TeacherProfile from './pages/TeacherProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import AuthorityLogin from './pages/AuthorityLogin';
import TeacherEnhancement from './pages/TeacherEnhancement';
import Signin from './pages/Signin';

import Speedometer from './components/Speedometer';
import Loader from './components/Loader';
import Upload from "./upload"; // Assuming the filename is upload.jsx and same folder
import Uploading from './pages/Uploading';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1E2E50'
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/teacherlogin" element={<TeacherLogin />} />
      <Route path="/studentlogin" element={<StudentLogin />} />
      <Route path="/studentdashboard" element={<StudentDashboard />} />
      <Route path="/studentdashboardview" element={<StudentDashboardView />} />
      <Route path="/studentperformance" element={<StudentPerformance />} />
      <Route path="/teacherprofile" element={<TeacherProfile />} />
      <Route path="/teacherdashboard" element={<TeacherDashboard />} />
      <Route path="/authoritylogin" element={<AuthorityLogin />} />
      <Route path="/teacherenhancement" element={<TeacherEnhancement />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/speedometer" element={<Speedometer value={741} />} />
      <Route path="/loader" element={<Loader />} />
      <Route path="/upload" element={<Upload />} />
      <Route path='/uploading' element={<Uploading/>} />
    </Routes>
  );
}

export default App;
