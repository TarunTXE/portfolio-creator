import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const templatesList = [
  {
    id: 'modern',
    name: 'Modern Flex',
    description: 'A vibrant card-based layout with clean gradient styles. Best for designers or marketers.',
    color: 'bg-blue-600',
    hover: 'hover:border-blue-500'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Clean, elegant, whitespace-heavy. Perfect for writers or minimalists.',
    color: 'bg-neutral-800',
    hover: 'hover:border-neutral-500'
  },
  {
    id: 'creative',
    name: 'Creative Pop',
    description: 'Colorful angled sections that stand out. Great for illustrators or creatives.',
    color: 'bg-pink-600',
    hover: 'hover:border-pink-500'
  },
  {
    id: 'developer',
    name: 'Dev Terminal',
    description: 'Dark-themed Github/IDE aesthetic. Built for software engineers.',
    color: 'bg-emerald-600',
    hover: 'hover:border-emerald-500'
  }
];

const ChooseTemplate = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const handleSelect = () => {
    if (!selected) return;
    // Navigate to builder with the chosen template pre-selected via query param
    navigate(`/builder?template=${selected}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Choose Your Starting Boilerplate</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Start with a professionally designed template. You can fully customize colors, fonts, and sections later in the builder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {templatesList.map((tpl) => (
          <div 
            key={tpl.id}
            onClick={() => setSelected(tpl.id)}
            className={`
              relative cursor-pointer bg-white rounded-2xl p-6 border-2 transition-all duration-300
              ${selected === tpl.id ? 'border-indigo-600 shadow-lg shadow-indigo-100 scale-[1.02]' : 'border-slate-200 shadow-sm hover:shadow-md ' + tpl.hover}
            `}
          >
            {/* Color accent bar */}
            <div className={`h-24 w-full rounded-xl mb-6 ${tpl.color} opacity-20`} />
            
            {selected === tpl.id && (
              <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{tpl.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tpl.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-slate-200 pt-8">
        <button
          onClick={handleSelect}
          disabled={!selected}
          className="px-10 py-4 text-lg rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          {selected ? 'Continue with Selected Template →' : 'Select a template'}
        </button>
      </div>
    </div>
  );
};

export default ChooseTemplate;
