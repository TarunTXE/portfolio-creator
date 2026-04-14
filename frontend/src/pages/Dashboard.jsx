import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPortfolios();
  }, [user, navigate]);

  const fetchPortfolios = async () => {
    try {
      const { data } = await api.getPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      await api.deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete portfolio');
    }
  };

  const handleShare = async (id) => {
    const url = `${window.location.origin}/portfolio/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-slate-600 mt-1">Manage your portfolios</p>
        </div>
        <Link
          to="/choose-template"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Portfolio
        </Link>
      </div>

      {/* Portfolio Cards */}
      {portfolios.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-6xl mb-4">📁</p>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No portfolios yet</h3>
          <p className="text-slate-500 mb-6">Create your first portfolio to get started!</p>
          <Link
            to="/choose-template"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm inline-block"
          >
            Create Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{portfolio.title}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 capitalize">
                    {portfolio.template}
                  </span>
                </div>
              </div>

              {/* Bio preview */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{portfolio.bio}</p>

              {/* Stats row */}
              <div className="flex gap-4 text-xs text-slate-500 mb-6">
                <span>🛠 {portfolio.skills?.length || 0} skills</span>
                <span>📂 {portfolio.projects?.length || 0} projects</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/builder/${portfolio._id}`}
                  className="flex-1 text-center py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition-colors"
                >
                  ✏️ Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleShare(portfolio._id)}
                  className="flex-1 text-center py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  🔗 Share
                </button>
                <Link
                  to={`/portfolio/${portfolio._id}`}
                  className="flex-1 text-center py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-sm font-medium transition-colors"
                >
                  👁 View
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(portfolio._id)}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors flex items-center justify-center"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
