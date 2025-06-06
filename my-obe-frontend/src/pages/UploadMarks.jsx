// // src/pages/UploadMarks.jsx
// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// export default function UploadMarks() {
//   const [file, setFile] = useState(null);
//   const [chartData, setChartData] = useState([]);
//   const navigate = useNavigate();

//   const handleUpload = async () => {
//     const form = new FormData();
//     form.append('file', file);
//     const res = await axios.post('http://localhost:8000/api/analyze/', form, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });
//     const { class_co_averages, student_analysis } = res.data;
//     setChartData(class_co_averages);
//     // store student_analysis to session storage for dashboard route
//     sessionStorage.setItem('student_data', JSON.stringify(student_analysis));
//   };

//   return (
//     <div className="flex flex-col flex-1">
//       <Header title="Upload Marks" />
//       <div className="p-6">
//         <input
//           type="file"
//           accept=".xlsx"
//           onChange={e => setFile(e.target.files[0])}
//           className="mb-4"
//         />
//         <button
//           onClick={handleUpload}
//           disabled={!file}
//           className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
//         >
//           Upload & Analyze
//         </button>
//       </div>
//       {chartData.length > 0 && (
//         <div className="p-6 h-64">
//           <ResponsiveContainer>
//             <BarChart data={chartData}>
//               <XAxis dataKey="CO" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="Mark" fill="#4A5568" />
//             </BarChart>
//           </ResponsiveContainer>
//           <div className="mt-4">
//             <h2 className="text-lg font-medium">Students</h2>
//             {JSON.parse(sessionStorage.getItem('student_data')).map(s => (
//               <div
//                 key={s.register_number}
//                 className="p-2 hover:bg-gray-50 cursor-pointer"
//                 onClick={() => navigate(`/student/${s.register_number}`)}
//               >
//                 {s.register_number} - {s.performance}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }