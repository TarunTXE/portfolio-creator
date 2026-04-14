import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-3xl">
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight">
            Build Your <span className="gradient-text">Dream Portfolio</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Create stunning, professional portfolios in minutes. Choose from multiple templates,
            customize every detail, share with a unique link, and export to PDF — all for free.
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all shadow-md shadow-blue-500/20"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all shadow-md shadow-blue-500/20"
                >
                  Get Started Free →
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-lg transition-all shadow-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🖌️', title: 'Multiple Templates', desc: 'Choose from Modern, Classic, and Minimal styles that look professional.' },
            { icon: '⚡', title: 'Live Preview', desc: 'See changes in real-time as you edit your portfolio sections.' },
            { icon: '🔗', title: 'Shareable Link', desc: 'Each portfolio gets a unique URL you can share with anyone.' },
            { icon: '📄', title: 'PDF Export', desc: 'Download your portfolio as a beautifully formatted A4 PDF.' },
            { icon: '🛡️', title: 'Secure Auth', desc: 'JWT-based authentication keeps your data safe and private.' },
            { icon: '🎨', title: 'Clean Design', desc: 'Minimalist and professional interface focused on your content.' },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-3">{f.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-200">
        © 2026 Portfolio Creator — Built by Group 11 with 💙
      </footer>
    </div>
  );
};

export default Home;
