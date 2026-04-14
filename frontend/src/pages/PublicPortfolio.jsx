import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import TemplateModern from '../components/templates/TemplateModern';
import TemplateMinimal from '../components/templates/TemplateMinimal';
import TemplateCreative from '../components/templates/TemplateCreative';
import TemplateDeveloper from '../components/templates/TemplateDeveloper';
import FeedbackSection from '../components/FeedbackSection';

const PublicPortfolio = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await api.getPortfolioById(id);
        setPortfolio(data);
      } catch (err) {
        setError('Portfolio not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [id]);

  // PDF export using html2pdf.js
  // Strategy: temporarily disable ALL stylesheets during PDF rendering.
  // Since our templates use only inline styles, the PDF will look correct
  // while avoiding Tailwind v4's oklch() colors that crash html2canvas.
  const [exporting, setExporting] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      // 1. Clone the portfolio content
      const original = printRef.current;
      const clone = original.cloneNode(true);

      // 2. Create a standalone container off-screen
      const container = document.createElement('div');
      container.style.cssText =
        'position:fixed;left:-9999px;top:0;width:800px;background:#fff;color:#000;font-family:sans-serif;';
      container.appendChild(clone);

      // 3. Create a standalone iframe to completely isolate from page styles
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;';
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = 'about:blank';
      });

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;font-family:sans-serif;}</style></head><body></body></html>`);
      iframeDoc.close();

      // 4. Move clone into iframe (completely isolated from Tailwind styles)
      iframeDoc.body.appendChild(clone);

      // 5. Generate PDF from the isolated iframe content
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${portfolio.title || 'portfolio'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf(iframeDoc.body, opt);

      // 6. Cleanup
      document.body.removeChild(iframe);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Not Found</h2>
          <p className="text-slate-500">The link may be broken or the portfolio was deleted.</p>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    const props = { portfolio };
    switch (portfolio.template) {
      case 'minimal': return <TemplateMinimal {...props} />;
      case 'creative': return <TemplateCreative {...props} />;
      case 'developer': return <TemplateDeveloper {...props} />;
      default: return <TemplateModern {...props} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Action buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={handleShare}
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          🔗 Share
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? '⏳ Exporting...' : '📄 Export PDF'}
        </button>
      </div>

      {/* Portfolio content (used as PDF target) */}
      <div ref={printRef}>
        {renderTemplate()}
      </div>

      {/* Feedback Section */}
      <FeedbackSection portfolioId={portfolio._id} />
    </div>
  );
};

export default PublicPortfolio;
