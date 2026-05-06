import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

ChartJS.defaults.color = '#888888';
ChartJS.defaults.font.family = 'Inter, sans-serif';

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

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
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <header className="flex justify-between items-center pb-2">
        <h2 className="text-3xl font-bold text-brand-white">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <button className="bg-brand-surface border border-brand-border px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:border-[#fe4900] transition-colors text-brand-white">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 30 Days
          </button>
        </div>
      </header>

      {/* Metric Cards Top Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.totalLeads}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Total Leads</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['New'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">New Leads</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['Qualified'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Qualified Leads</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-4xl font-bold text-brand-white mb-2">{stats.statusCounts['Won'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Won Leads</div>
        </div>
      </section>

      {/* Metric Cards Bottom Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-4xl font-bold text-brand-orange mb-2">{stats.statusCounts['Lost'] || 0}</div>
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium">Lost Leads</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
          <div className="text-sm text-brand-text-sec uppercase tracking-wider font-medium mb-2">Total Estimated Deal Value</div>
          <div className="text-4xl font-bold text-brand-white">${stats.pipelineValue?.toLocaleString()}</div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#666] transition-colors">
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
    </div>
  );
};

export default Dashboard;
