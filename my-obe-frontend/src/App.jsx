// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./upload"; // Assuming the filename is upload.jsx and same folder

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f9f9f9] p-4 font-poppins">
        <Routes>
          <Route path="/" element={<Upload />} />
          {/* Add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
