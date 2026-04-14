import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import TemplateModern from '../components/templates/TemplateModern';
import TemplateMinimal from '../components/templates/TemplateMinimal';
import TemplateCreative from '../components/templates/TemplateCreative';
import TemplateDeveloper from '../components/templates/TemplateDeveloper';

const emptyData = {
  title: '',
  bio: '',
  template: 'modern',
  contactEmail: '',
  contactPhone: '',
  profileImage: '',
  skills: [],
  projects: [],
  education: [],
  customizations: {
    primaryColor: '#3b82f6',
    fontFamily: 'sans-serif',
    layout: 'top',
    showSkills: true,
    showProjects: true,
    showEducation: true,
    showContact: true,
  }
};

const Builder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [data, setData] = useState(emptyData);
  const [newSkill, setNewSkill] = useState('');
  const [tab, setTab] = useState('info'); // info | design | skills | projects | education | preview
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (id) {
      api.getPortfolioById(id).then(({ data }) => {
        // Ensure customizations object exists for legacy portfolios
        if (!data.customizations) {
          data.customizations = emptyData.customizations;
        }
        setData(data);
      }).catch(console.error);
    } else {
      const sp = new URLSearchParams(location.search);
      const t = sp.get('template');
      if (t) {
        // Apply default colors based on chosen template
        const colors = {
          'modern': '#3b82f6',
          'minimal': '#171717',
          'creative': '#ec4899',
          'developer': '#10b981'
        };
        const fonts = {
          'modern': 'sans-serif',
          'minimal': 'serif',
          'creative': 'cursive, sans-serif',
          'developer': 'monospace'
        };
        setData(prev => ({ 
          ...prev, 
          template: t,
          customizations: {
            ...prev.customizations,
            primaryColor: colors[t] || '#3b82f6',
            fontFamily: fonts[t] || 'sans-serif'
          }
        }));
      }
    }
  }, [id, user, navigate, location.search]);

  // ─── Helpers ──────────────────────────
  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const updateCustomization = (field, value) => setData(prev => ({
    ...prev,
    customizations: { ...prev.customizations, [field]: value }
  }));

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update(field, reader.result);
    reader.readAsDataURL(file);
  };

  // Skills
  const addSkill = () => {
    if (!newSkill.trim()) return;
    update('skills', [...data.skills, { name: newSkill.trim() }]);
    setNewSkill('');
  };
  const removeSkill = (i) => update('skills', data.skills.filter((_, idx) => idx !== i));

  // Projects
  const addProject = () => update('projects', [...data.projects, { title: '', description: '', imageUrl: '' }]);
  const updateProject = (i, field, value) => {
    const updated = [...data.projects];
    updated[i] = { ...updated[i], [field]: value };
    update('projects', updated);
  };
  const removeProject = (i) => update('projects', data.projects.filter((_, idx) => idx !== i));

  const handleProjectImage = (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateProject(i, 'imageUrl', reader.result);
    reader.readAsDataURL(file);
  };

  // Education
  const addEducation = () => update('education', [...data.education, { degree: '', institution: '', year: '' }]);
  const updateEducation = (i, field, value) => {
    const updated = [...data.education];
    updated[i] = { ...updated[i], [field]: value };
    update('education', updated);
  };
  const removeEducation = (i) => update('education', data.education.filter((_, idx) => idx !== i));

  // Save
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (id) {
        await api.updatePortfolio(id, data);
        setMessage('Portfolio updated!');
      } else {
        const res = await api.createPortfolio(data);
        setMessage('Portfolio created!');
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ─── Tab content renderers ────────────
  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm';

  const renderInfo = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio Title</label>
        <input className={inputClass} placeholder="My Awesome Portfolio" value={data.title} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About</label>
        <textarea className={inputClass + ' min-h-[100px]'} placeholder="Tell the world about yourself..." value={data.bio} onChange={(e) => update('bio', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
        <input className={inputClass} type="email" placeholder="you@example.com" value={data.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
        <input className={inputClass} type="tel" placeholder="+1 234 567 890" value={data.contactPhone || ''} onChange={(e) => update('contactPhone', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profileImage')} className="text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:cursor-pointer hover:file:bg-blue-100" />
        {data.profileImage && <img src={data.profileImage} alt="Profile" className="mt-3 h-20 w-20 rounded-full object-cover border-2 border-indigo-500" />}
      </div>
    </div>
  );

  const renderDesign = () => (
    <div className="space-y-8">
      {/* Templates */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3">Change Template</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {id: 'modern', name: 'Modern'},
            {id: 'minimal', name: 'Minimal'},
            {id: 'creative', name: 'Creative'},
            {id: 'developer', name: 'Developer'}
          ].map(t => (
            <button
              key={t.id}
              onClick={() => update('template', t.id)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                data.template === t.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors & Fonts */}
        <div className="space-y-5">
          <label className="block text-sm font-bold text-slate-800 mb-2">Style Preferences</label>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={data.customizations.primaryColor} 
                onChange={e => updateCustomization('primaryColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-sm font-mono text-slate-500">{data.customizations.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Font Style</label>
            <select 
              value={data.customizations.fontFamily}
              onChange={e => updateCustomization('fontFamily', e.target.value)}
              className={inputClass}
            >
              <option value="sans-serif">Modern (Sans-serif)</option>
              <option value="serif">Classic (Serif)</option>
              <option value="monospace">Developer (Monospace)</option>
              <option value="cursive, sans-serif">Playful (Cursive)</option>
              <option value="system-ui, -apple-system, sans-serif">System Native</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Layout Focus</label>
            <select 
              value={data.customizations.layout}
              onChange={e => updateCustomization('layout', e.target.value)}
              className={inputClass}
            >
              <option value="top">Top Header / Standard</option>
              <option value="left">Left Sidebar Style</option>
              <option value="right">Right Sidebar Style</option>
            </select>
          </div>
        </div>

        {/* Output sections toggles */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-800 mb-2">Visible Sections</label>
          {['showSkills', 'showProjects', 'showEducation', 'showContact'].map((key) => (
            <label key={key} className="flex items-center cursor-pointer gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={data.customizations[key]}
                  onChange={e => updateCustomization(key, e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${data.customizations[key] ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.customizations[key] ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-slate-700 capitalize">
                {key.replace('show', '')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className={inputClass} placeholder="e.g. React, Node.js…" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
        <button onClick={addSkill} className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all whitespace-nowrap">+ Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm border border-indigo-100">
            {s.name}
            <button onClick={() => removeSkill(i)} className="ml-1 text-red-500 hover:text-red-600">×</button>
          </span>
        ))}
      </div>
      {data.skills.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No skills added yet. Start typing above!</p>}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {data.projects.map((p, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Project {i + 1}</h4>
            <button onClick={() => removeProject(i)} className="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
          </div>
          <input className={inputClass} placeholder="Project Title" value={p.title} onChange={(e) => updateProject(i, 'title', e.target.value)} />
          <textarea className={inputClass + ' min-h-[80px]'} placeholder="Description" value={p.description} onChange={(e) => updateProject(i, 'description', e.target.value)} />
          <input type="file" accept="image/*" onChange={(e) => handleProjectImage(e, i)} className="text-slate-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:cursor-pointer hover:file:bg-indigo-100" />
          {p.imageUrl && <img src={p.imageUrl} alt="project" className="mt-2 rounded-lg max-h-40 object-cover" />}
        </div>
      ))}
      <button onClick={addProject} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all font-medium">
        + Add Project
      </button>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      {data.education.map((e, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Education {i + 1}</h4>
            <button onClick={() => removeEducation(i)} className="text-red-500 hover:text-red-600 text-sm font-medium">Remove</button>
          </div>
          <input className={inputClass} placeholder="Degree / Course" value={e.degree} onChange={(ev) => updateEducation(i, 'degree', ev.target.value)} />
          <input className={inputClass} placeholder="Institution" value={e.institution} onChange={(ev) => updateEducation(i, 'institution', ev.target.value)} />
          <input className={inputClass} placeholder="Year (e.g. 2020 – 2024)" value={e.year} onChange={(ev) => updateEducation(i, 'year', ev.target.value)} />
        </div>
      ))}
      <button onClick={addEducation} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all font-medium">
        + Add Education
      </button>
    </div>
  );

  const renderPreview = () => {
    const props = { portfolio: data };
    switch (data.template) {
      case 'minimal': return <TemplateMinimal {...props} />;
      case 'creative': return <TemplateCreative {...props} />;
      case 'developer': return <TemplateDeveloper {...props} />;
      default: return <TemplateModern {...props} />;
    }
  };

  const tabs = [
    { key: 'info', label: '📝 Info' },
    { key: 'design', label: '🎨 Customize' },
    { key: 'skills', label: '🛠 Skills' },
    { key: 'projects', label: '📂 Projects' },
    { key: 'education', label: '🎓 Education' },
    { key: 'preview', label: '👁 Preview' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 justify-center">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 min-w-[120px] ${
              tab === t.key 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-slate-200 shadow-lg shadow-slate-100 rounded-3xl p-6 sm:p-10 mb-8 min-h-[500px]">
        {tab === 'info' && renderInfo()}
        {tab === 'design' && renderDesign()}
        {tab === 'skills' && renderSkills()}
        {tab === 'projects' && renderProjects()}
        {tab === 'education' && renderEducation()}
        {tab === 'preview' && (
           <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
             {renderPreview()}
           </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between bg-white px-8 py-4 border border-slate-200 rounded-2xl shadow-lg sticky bottom-6">
        {message ? (
          <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {message}
          </p>
        ) : (
          <p className="text-sm text-slate-500 font-medium">Don't forget to save your changes!</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto px-10 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5"
        >
          {saving ? '⏳ Saving...' : id ? 'Save Changes' : 'Create & Save'}
        </button>
      </div>
    </div>
  );
};

export default Builder;
