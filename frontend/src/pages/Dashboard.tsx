import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ILead } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

ChartJS.defaults.color = '#888888';
ChartJS.defaults.font.family = 'Inter, sans-serif';

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  // Modal State
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalLeads, setModalLeads] = useState<ILead[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const handleTileClick = async (title: string, statusFilter?: string) => {
    setModalTitle(title);
    setIsModalLoading(true);
    setModalLeads([]); // clear prev
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await api.get('/leads', { params });
      setModalLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads for modal', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalTitle(null);
  };

  if (!stats) return <div className="text-brand-text-sec p-8">Loading dashboard...</div>;

  const leadStatusData = {
    labels: Object.keys(stats.statusCounts),
    datasets: [
      {
        label: 'Leads',
        data: Object.values(stats.statusCounts),
        backgroundColor: '#fe4900',
        borderRadius: 4,
        barPercentage: 0.6,
      }
    ]
  };

  const leadStatusOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: '#222222' }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false }, ticks: { color: '#ffffff', font: { weight: 500 } } }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-white">Dashboard Overview</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-brand-surface border border-brand-border px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:border-[#fe4900] transition-colors text-brand-white">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 30 Days
          </button>
        </div>
      </header>

      {/* Metric Cards Top Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => handleTileClick('Total Leads')}
          className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#fe4900] transition-colors cursor-pointer"
        >
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.totalLeads}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Total Leads</div>
        </div>
        <div 
          onClick={() => handleTileClick('New Leads', 'New')}
          className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#fe4900] transition-colors cursor-pointer"
        >
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['New'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">New Leads</div>
        </div>
        <div 
          onClick={() => handleTileClick('Qualified Leads', 'Qualified')}
          className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#fe4900] transition-colors cursor-pointer"
        >
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['Qualified'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Qualified Leads</div>
        </div>
        <div 
          onClick={() => handleTileClick('Won Leads', 'Won')}
          className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#fe4900] transition-colors cursor-pointer"
        >
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['Won'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Won Leads</div>
        </div>
      </section>

      {/* Metric Cards Bottom Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => handleTileClick('Lost Leads', 'Lost')}
          className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#fe4900] transition-colors cursor-pointer"
        >
          <div className="text-4xl font-bold text-brand-orange mb-2">{stats.statusCounts['Lost'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Lost Leads</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium mb-2">Total Estimated Deal Value</div>
          <div className="text-4xl font-bold text-brand-white">${stats.pipelineValue?.toLocaleString()}</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium mb-2">Total Value of Won Deals</div>
          <div className="text-4xl font-bold text-brand-white">${stats.totalRevenue?.toLocaleString()}</div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-white mb-6 border-b border-brand-border pb-4">Lead Status Distribution</h3>
          <div className="relative h-72 w-full">
            <Bar data={leadStatusData} options={leadStatusOptions} />
          </div>
        </div>
      </section>

      {/* Leads List Modal */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Panel */}
          <div className="relative bg-brand-surface border border-brand-border rounded-xl shadow-2xl w-full max-w-4xl mx-4 p-4 sm:p-8 z-10 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-brand-border">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-white">{modalTitle}</h2>
              <button
                onClick={closeModal}
                className="text-brand-text-sec hover:text-brand-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 kanban-scroll pr-2">
              {isModalLoading ? (
                <div className="text-brand-text-sec text-center py-8">Loading leads...</div>
              ) : modalLeads.length === 0 ? (
                <div className="text-brand-text-sec text-center py-8">No leads found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {modalLeads.map((lead) => (
                    <Link to={`/leads/${lead._id}`} key={lead._id} className="bg-brand-black border border-brand-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-[#fe4900] transition-colors group">
                      <div className="flex flex-col mb-4 sm:mb-0">
                        <span className="text-brand-white font-semibold text-lg">{lead.name}</span>
                        <span className="text-brand-text-sec text-sm flex items-center gap-2 mt-1">
                          <span className="material-symbols-outlined text-[16px]">domain</span>
                          {lead.company}
                        </span>
                      </div>
                      <div className="flex flex-col sm:items-end text-sm gap-2">
                        <span className="text-brand-text-sec flex items-center gap-2">
                           <span className="material-symbols-outlined text-[16px]">email</span>
                           {lead.email || 'N/A'}
                        </span>
                        <span className="text-brand-text-sec flex items-center gap-2 group-hover:text-brand-white transition-colors">
                           <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                           View Details
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
