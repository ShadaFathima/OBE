import { NavLink } from 'react-router-dom';
import { Home, User, Users } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/student', label: 'Student Dashboard', icon: User },
    { to: '/teacher', label: 'Teacher Dashboard', icon: Users },
  ];
  return (
    <div className="h-screen w-20 flex flex-col bg-gray-100 p-4 space-y-4">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          to={to}
          key={to}
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-200 ${isActive ? 'bg-white shadow' : ''}`
          }
          title={label}
        >
          <Icon className="w-6 h-6 text-gray-700" />
        </NavLink>
      ))}
    </div>
  );
}
