import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface PrecheckPageProps {
    onConfirm: () => void;
    onBack: () => void;
}

const PrecheckPage: React.FC<PrecheckPageProps> = ({ onConfirm, onBack }) => {
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
                <p className="text-slate-500 font-medium">Please ensure your settings match for accurate screening.</p>
            </div>

            <div className="space-y-3">
                {checkItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 bg-slate-50 border-slate-100 transition-all"
                    >
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                            {item.icon}
                        </div>

                        <div className="flex-1">
                            <div className="text-slate-900 font-bold">{item.text}</div>
                            <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Sanity Check</span>
                <div className="bg-slate-900 p-6 rounded-xl text-center shadow-inner">
                    <p className="text-white/50 mb-2 text-[10px] font-medium">Verify that the text below is sharp and clearly legible</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-[0.2em] uppercase">
                        ISHIHARA
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
                    className="btn-primary flex-[2] hover:shadow-primary/40 transition-all"
                    aria-label="Confirm environment check and start test"
                >
                    I'm Ready — Start Test
                </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
                Checking these ensures your screen reproduces clinical colors accurately.
            </p>
        </div>
    );
};

export default PrecheckPage;
