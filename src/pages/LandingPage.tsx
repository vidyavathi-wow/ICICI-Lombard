import React from 'react';
import { ShieldCheck, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';

// Simple Clock component missing from lucide
const Clock = ({ className, size }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Ishihara Color Vision <span className="text-primary">Screening</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    A professional-grade digital evaluation for Red-Green color deficiency.
                    Fast, accurate, and optimized for modern displays.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-left">
                {[
                    { icon: <ShieldCheck className="text-blue-500" />, title: 'Clinical Precision', desc: 'Based on standard Ishihara test patterns' },
                    { icon: <RefreshCw className="text-green-500" />, title: 'Anti-memorization', desc: 'Procedurally generated plates every time' },
                    { icon: <Clock className="text-orange-500" />, title: 'Quick Screening', desc: 'Evaluate your vision in under 2 minutes' }
                ].map((item, i) => (
                    <div key={i} className="glass p-4 rounded-xl space-y-2">
                        <div className="mb-2">{item.icon}</div>
                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={onStart}
                className="btn-primary !rounded-full !py-3 !px-8 flex items-center gap-2 group mx-auto"
                aria-label="Start Color Vision Screening"
            >
                Start Screening
                <ChevronRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>

            <div className="flex items-center justify-center gap-2 p-3 bg-secondary/10 text-secondary rounded-xl text-xs font-bold animate-pulse">
                <AlertCircle size={16} />
                <span>MEDICAL SCREENING ONLY — NOT A CLINICAL DIAGNOSIS</span>
            </div>
        </div>
    );
};

export default LandingPage;
