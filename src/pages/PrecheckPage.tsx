import React, { useState } from 'react';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';

interface PrecheckPageProps {
    onConfirm: () => void;
    onBack: () => void;
}

const PrecheckPage: React.FC<PrecheckPageProps> = ({ onConfirm, onBack }) => {
    const [checks, setChecks] = useState({
        brightness: false,
        filters: false,
        glare: false,
    });



    const allChecked = checks.brightness && checks.filters && checks.glare;

    const toggleCheck = (id: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const checkItems = [
        {
            id: 'brightness' as const,
            icon: <Sun className="text-yellow-500" />,
            text: 'Brightness set to 80%+',
            desc: 'High brightness is critical for color accuracy.'
        },
        {
            id: 'filters' as const,
            icon: <Moon className="text-indigo-500" />,
            text: 'Blue light filters are OFF',
            desc: 'Night shift or blue light filters distort colors.'
        },
        {
            id: 'glare' as const,
            icon: <Monitor className="text-blue-500" />,
            text: 'No screen glare',
            desc: 'Reflections can hide subtle color patterns.'
        },
    ];

    return (
        <div className="max-w-xl w-full glass p-6 md:p-8 rounded-2xl space-y-6 md:space-y-8 animate-fade-in">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Environment Check</h2>
                <p className="text-slate-500 font-medium">Verify your settings for accurate screening.</p>
            </div>

            <div className="space-y-3">
                {checkItems.map((item) => (
                    <label
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${checks[item.id]
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                            }`}
                    >
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={checks[item.id]}
                                onChange={() => toggleCheck(item.id)}
                                className="peer hidden"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checks[item.id] ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                                }`}>
                                {checks[item.id] && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                        </div>

                        <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>

                        <div className="flex-1">
                            <div className="text-slate-900 font-bold">{item.text}</div>
                            <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                    </label>
                ))}
            </div>



            <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Sanity Check</span>
                <div className="bg-slate-900 p-6 rounded-xl text-center shadow-inner">
                    <p className="text-white/50 mb-2 text-[10px] font-medium">Text must be perfectly clear before starting</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
                        ISHIHARA-SCREEN-2026
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onBack}
                    className="btn-secondary flex-1"
                    aria-label="Go back to landing page"
                >
                    Go Back
                </button>
                <button
                    onClick={onConfirm}
                    disabled={!allChecked}
                    className={`btn-primary flex-[2] transition-all duration-500 ${!allChecked ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : 'hover:shadow-primary/40'
                        }`}
                    aria-label="Confirm environment check and start test"
                >
                    {allChecked ? "I'm Ready — Start Test" : "Verify All to Start"}
                </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
                Checking these ensures your screen reproduces clinical colors accurately.
            </p>
        </div>
    );
};

export default PrecheckPage;
