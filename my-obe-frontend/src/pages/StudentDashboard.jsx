import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    const all = JSON.parse(sessionStorage.getItem('student_data'));
    const student = all.find(s => s.register_number === id);
    setData(student);
  }, [id]);

  if (!data) return <div>Loading...</div>;

  const chartData = Object.entries(data.weak_cos.reduce((acc, co) => {
    acc.push({ CO: co, Mark: data.performance === 'At-risk' ? 0 : 10 });
    return acc;
  }, []));

  return (
    <div className="flex flex-col flex-1">
      <Header title={`Student ${id}`} />
      <div className="p-6 space-y-6">
        <div>Performance: <strong>{data.performance}</strong></div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data.weak_cos.map(co => ({ CO: co, Value: 10 }))}>
              <XAxis dataKey="CO" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Value" stroke="#4A5568" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-lg font-medium">Recommendations</h2>
          {data.recommendations.map(r => (
            <div key={r.co} className="p-4 border rounded mb-2">
              <h3 className="font-semibold">{r.co}</h3>
              <p>{r.strategy}</p>
              <a href={r.materials.read_more} className="text-blue-600">Read More</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
