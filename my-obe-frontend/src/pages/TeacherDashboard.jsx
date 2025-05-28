// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    setStudents(JSON.parse(sessionStorage.getItem('student_data')));
  }, []);

  const categoryCounts = students.reduce((acc, s) => {
    acc[s.performance] = (acc[s.performance] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="flex flex-col flex-1">
      <Header title="Teacher Dashboard" />
      <div className="p-6 grid grid-cols-2 gap-6">
        <div className="h-64 col-span-1">
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="value" data={pieData} outerRadius={80} fill="#4A5568">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4A5568','#A0AEC0','#E2E8F0'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64 col-span-1">
          <ResponsiveContainer>
            <BarChart data={students.map(s => ({ Register: s.register_number, Score: s.weak_cos.length }))}>
              <XAxis dataKey="Register" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Score" fill="#4A5568" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}