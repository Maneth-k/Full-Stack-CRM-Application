import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600 border-b">CRM System</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/leads" className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
            <Users size={20} />
            <span>Leads</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="text-sm font-medium text-gray-900 mb-2 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
