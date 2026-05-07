import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-brand-black text-brand-white flex min-h-screen font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`flex flex-col h-screen fixed left-0 top-0 z-50 p-space-md bg-brand-surface border-r border-brand-border w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-space-xl px-2 flex justify-between items-center">
          <div>
            <h1 className="font-headline-lg text-[36px] font-black text-brand-orange leading-[1.2]">
              Velocity
            </h1>
            <p className="font-caption text-[16px] text-brand-text-sec uppercase tracking-widest mt-1">
              Crystal clear sales tracking
            </p>
          </div>
          <button 
            className="md:hidden text-brand-text-sec hover:text-brand-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          <Link
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 font-label-bold text-[14px] transition-all duration-150 ${
              isActive("/")
                ? "text-brand-orange border-r-2 border-brand-orange bg-brand-orange/10"
                : "text-brand-text-sec hover:text-brand-white hover:bg-brand-border/50"
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link
            to="/leads"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 font-label-bold text-[14px] transition-all duration-150 ${
              isActive("/leads")
                ? "text-brand-orange border-r-2 border-brand-orange bg-brand-orange/10"
                : "text-brand-text-sec hover:text-brand-white hover:bg-brand-border/50"
            }`}
          >
            <span className="material-symbols-outlined">person</span>
            Leads
          </Link>
        </nav>
        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-text-sec">
            <span className="material-symbols-outlined text-2xl text-brand-orange">
              account_circle
            </span>
            <span className="text-sm truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-brand-text-sec hover:text-brand-white hover:bg-brand-border/50 transition-colors rounded-lg text-left font-label-bold text-[14px]"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 bg-brand-black min-h-screen relative z-10 w-full">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center p-4 border-b border-brand-border bg-brand-surface sticky top-0 z-30">
          <button 
            className="text-brand-white flex items-center justify-center"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <span className="ml-4 font-headline-md text-xl font-bold text-brand-orange">Velocity</span>
        </div>
        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
