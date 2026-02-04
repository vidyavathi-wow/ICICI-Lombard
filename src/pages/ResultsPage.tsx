import React from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { PlateConfig } from '../utils/plateGenerator';
import { Response } from '../types';

interface ResultsPageProps {
    responses: Response[];
    sessionPlates: PlateConfig[];
    trackEvent: (name: string, properties?: any) => void;
    onBack: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ responses, sessionPlates, trackEvent, onBack }) => {
    const getClassification = () => {
        const diagnosticResponses = responses.filter((_, i) => sessionPlates[i].type !== 'demonstration');
        const diagnosticCorrect = diagnosticResponses.filter(r => r.isCorrect).length;
        const avgResponseTime = responses.reduce((acc, r) => acc + r.responseTimeMs, 0) / (responses.length || 1);
        const blankCount = responses.filter(r => r.answer === 'none').length;

        // Inconclusive: high blanks, very slow responses
        if (blankCount > 4 || avgResponseTime > 8000) {
            return {
                label: 'Inconclusive',
                color: 'text-slate-600',
                icon: <RefreshCw className="w-12 h-12 text-slate-400 animate-spin-slow" />,
                reason: 'The test results were inconsistent due to long response times or multiple skips.'
            };
        }

        if (diagnosticCorrect >= 10) return { label: 'Likely Normal', color: 'text-green-600', icon: <CheckCircle2 className="w-12 h-12 text-green-600" /> };
        if (diagnosticCorrect >= 7) return { label: 'Possible Mild Deficiency', color: 'text-yellow-600', icon: <AlertCircle className="w-12 h-12 text-yellow-600" /> };
        return { label: 'Possible Red-Green Deficiency', color: 'text-red-600', icon: <AlertCircle className="w-12 h-12 text-red-600" /> };
    };

    const classification = getClassification();
    const totalCorrect = responses.filter(r => r.isCorrect).length;
    const avgTime = (responses.reduce((acc, r) => acc + r.responseTimeMs, 0) / (responses.length || 1) / 1000).toFixed(1);

    return (
        <div className="max-w-2xl w-full glass p-6 md:p-10 rounded-2xl space-y-6 md:space-y-8 text-center animate-fade-in">
            {classification.icon}

            <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Screening Complete</h2>
                <div className={`text-xl font-bold ${classification.color}`}>
                    Diagnosis: {classification.label}
                </div>
                <div className="text-lg font-bold text-slate-500">
                    Test result: {Math.round((totalCorrect / (responses.length || 1)) * 100)}% ({totalCorrect}/{responses.length})
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="text-3xl font-bold">{totalCorrect}/{responses.length}</div>
                    <div className="text-slate-500 text-sm">Total Correct</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="text-3xl font-bold">{avgTime}s</div>
                    <div className="text-slate-500 text-sm">Avg. Response Time</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex px-4 py-2 bg-slate-100 rounded-t-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="w-16">Plate</div>
                    <div className="flex-1 text-center">Your Answer</div>
                    <div className="w-20 text-right">Correct</div>
                </div>
                <div className="max-h-72 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                    {responses.map((res, i) => (
                        <div key={i} className={`flex items-center px-4 py-3 rounded-lg border-b border-slate-50 ${res.isCorrect ? 'text-slate-700' : 'bg-red-50/30 text-red-700'}`}>
                            <div className="w-16 font-mono text-xs text-slate-400">{(i + 1).toString().padStart(2, '0')}</div>
                            <div className="flex-1 text-center font-mono font-bold">
                                {res.answer === 'none' ? '—' : res.answer}
                            </div>
                            <div className="w-20 text-right font-mono font-bold text-slate-500">
                                {res.expectedAnswer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl text-left space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <ShieldCheck size={20} />
                    Next Steps & Recommendations
                </div>
                <p className="text-amber-800/80 text-sm leading-relaxed">
                    {classification.label === 'Inconclusive'
                        ? "We couldn't determine a clear result. Please ensure you are in a well-lit area, your screen is bright, and you answer each plate within 3-5 seconds."
                        : totalCorrect === responses.length
                            ? "Your color vision appears normal. We recommend regular eye check-ups as part of your overall health routine."
                            : "We detected some discrepancies in your color perception. This could indicate a level of color vision deficiency. We strongly recommend consulting an eye care professional for a formal clinical diagnosis."}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={onBack}
                    className="btn-secondary flex-1"
                    aria-label="Return to home screen"
                >
                    Back to Home
                </button>
                <div className="flex flex-1 gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary flex-1 !bg-secondary !border-secondary hover:!bg-secondary-light"
                        aria-label="Take the test again"
                    >
                        Retake
                    </button>
                    <button
                        className="btn-primary flex-1"
                        onClick={() => {
                            trackEvent('consultation_cta_clicked');
                            window.open('https://www.google.com/search?q=Best+Ophthalmologists+Near+Me', '_blank');
                        }}
                    >
                        Find Help
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-tight">
                WowVision. This screening tool is for educational purposes only. Diagnostic accuracy depends on display quality and environment.
            </div>
        </div>
    );
};

export default ResultsPage;
