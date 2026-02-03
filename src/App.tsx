import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Eye,
  ShieldCheck,
  Info,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import IshiharaPlate from './components/IshiharaPlate';
import NumericKeypad from './components/NumericKeypad';
import { PALETTES, PlateConfig } from './utils/plateGenerator';

// Types
type Screen = 'landing' | 'precheck' | 'test' | 'results';

interface Response {
  plateIndex: number;
  plateId: string;
  answer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

const PLATE_CATALOG: PlateConfig[] = [
  { plate_id: 'p01', number: '12', type: 'demonstration', colors: PALETTES.NORMAL, difficulty: 1 },
  { plate_id: 'p02', number: '8', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p03', number: '6', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p04', number: '29', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p05', number: '57', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p06', number: '5', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p07', number: '3', type: 'diagnostic', colors: PALETTES.CVD_CONFUSION_1, difficulty: 5 },
  { plate_id: 'p08', number: '15', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p09', number: '74', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p10', number: '45', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p11', number: '16', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p12', number: '2', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p13', number: '97', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p14', number: '35', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p15', number: '96', type: 'diagnostic', colors: PALETTES.CVD_CONFUSION_1, difficulty: 5 },
  { plate_id: 'p16', number: '42', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p17', number: '10', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p18', number: '7', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p19', number: '13', type: 'diagnostic', colors: PALETTES.CVD_CONFUSION_1, difficulty: 5 },
  { plate_id: 'p20', number: '26', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p21', number: '18', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p22', number: '9', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p23', number: '22', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p24', number: '4', type: 'diagnostic', colors: PALETTES.CVD_CONFUSION_1, difficulty: 5 },
  { plate_id: 'p25', number: '81', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p26', number: '63', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
  { plate_id: 'p27', number: '51', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 3 },
  { plate_id: 'p28', number: '38', type: 'diagnostic', colors: PALETTES.CVD_CONFUSION_1, difficulty: 5 },
  { plate_id: 'p29', number: '25', type: 'diagnostic', colors: PALETTES.NORMAL, difficulty: 2 },
  { plate_id: 'p30', number: '77', type: 'diagnostic', colors: PALETTES.REVERSED, difficulty: 4 },
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [sessionSeed] = useState(() => uuidv4());
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [testStartedAt, setTestStartedAt] = useState<number>(0);

  // Analytics helper (shorthand for POC)
  const trackEvent = (name: string, properties: any = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[Analytics] ${name}`, { ...properties, sessionSeed, timestamp });
  };

  useEffect(() => {
    trackEvent('test_landing_viewed');

    // Track abandonment
    const handleBeforeUnload = () => {
      if (screen === 'test') {
        trackEvent('test_abandoned', {
          last_plate_index: currentPlateIndex,
          total_plates: sessionPlates.length
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen, currentPlateIndex]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'test') return;

      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        setInputBuffer(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key.toLowerCase() === 'n') {
        handleNothing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, inputBuffer, currentPlateIndex]);

  // Randomize plates for this session (shuffing diagnostic plates while keeping demo first)
  const sessionPlates = useMemo(() => {
    const demo = PLATE_CATALOG.filter(p => p.type === 'demonstration');
    const diagnostic = PLATE_CATALOG.filter(p => p.type !== 'demonstration');

    // Anti-memorization: try to avoid plates shown in the very last session
    const lastSessionPlates = JSON.parse(localStorage.getItem('last_test_plates') || '[]');
    let pool = diagnostic;
    if (diagnostic.length > 20) {
      pool = diagnostic.filter(p => !lastSessionPlates.includes(p.plate_id));
      if (pool.length < 11) pool = diagnostic; // Fallback if filtered too much
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = [...demo, ...shuffled].slice(0, 12);

    return selected;
  }, []);

  const startTest = () => {
    // Store selected plate IDs to avoid them next time
    localStorage.setItem('last_test_plates', JSON.stringify(sessionPlates.map(p => p.plate_id)));

    trackEvent('precheck_completed', {
      brightness_confirmed: true,
      night_mode_off_confirmed: true,
      device_ua: navigator.userAgent
    });
    setScreen('test');
    setStartTime(Date.now());
    setTestStartedAt(Date.now());

    // Capture device context
    const deviceContext = {
      ua: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio,
      highContrast: window.matchMedia('(forced-colors: active)').matches,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };

    trackEvent('test_started', {
      plate_count: sessionPlates.length,
      device_context: deviceContext
    });

    trackEvent('plate_viewed', {
      plate_id: sessionPlates[0].plate_id,
      index: 0
    });
  };

  const currentPlate = sessionPlates[currentPlateIndex];

  const handleInput = (val: string) => {
    if (inputBuffer.length < 2) {
      setInputBuffer(prev => prev + val);
    }
  };

  const handleSubmit = () => {
    const responseTime = Date.now() - startTime;
    const isCorrect = inputBuffer === currentPlate.number;

    const newResponse: Response = {
      plateIndex: currentPlateIndex,
      plateId: currentPlate.plate_id,
      answer: inputBuffer || 'none',
      expectedAnswer: currentPlate.number,
      isCorrect,
      responseTimeMs: responseTime
    };

    setResponses([...responses, newResponse]);
    setInputBuffer('');

    trackEvent('plate_answer_submitted', {
      plate_id: currentPlate.plate_id,
      index: currentPlateIndex,
      answer: inputBuffer,
      is_correct: isCorrect,
      response_ms: responseTime
    });

    if (currentPlateIndex < sessionPlates.length - 1) {
      const nextIndex = currentPlateIndex + 1;
      setCurrentPlateIndex(nextIndex);
      setStartTime(Date.now());
      trackEvent('plate_viewed', {
        plate_id: sessionPlates[nextIndex].plate_id,
        index: nextIndex
      });
    } else {
      setScreen('results');
      trackEvent('test_completed', {
        total_correct: responses.length + (isCorrect ? 1 : 0),
        duration_ms: Date.now() - testStartedAt
      });
    }
  };

  const handleNothing = () => {
    setInputBuffer('none');
  };

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

  // Render Helpers
  const renderHeader = () => (
    <header className="py-6 px-4 flex justify-between items-center max-w-4xl mx-auto w-full border-b border-slate-100 mb-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-2 rounded-lg">
          <Eye className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-primary">ICICI <span className="text-secondary">Lombard</span> Vision</span>
      </div>
      {screen === 'test' && (
        <div className="text-sm font-medium text-slate-500">
          Plate {currentPlateIndex + 1} of {sessionPlates.length}
        </div>
      )}
    </header>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {renderHeader()}

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {screen === 'landing' && (
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
                <div key={i} className="glass p-4 rounded-2xl space-y-2">
                  <div className="mb-2">{item.icon}</div>
                  <h3 className="font-bold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen('precheck')}
              className="btn-primary flex items-center gap-2 group mx-auto"
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
        )}

        {screen === 'precheck' && (
          <div className="max-w-xl w-full glass p-8 rounded-3xl space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Environment Check</h2>
              <p className="text-slate-500">Ensure your device is ready for accurate results.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: <Sun className="text-yellow-500" />, text: 'Set brightness to at least 80%' },
                { icon: <Moon className="text-indigo-500" />, text: 'Turn off Blue Light filters (Night Shift/Night Light)' },
                { icon: <Monitor className="text-blue-500" />, text: 'Avoid direct glare on the screen' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">{item.icon}</div>
                  <span className="text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sanity Check</span>
              <div className="bg-slate-900 p-6 rounded-2xl text-center">
                <p className="text-white font-medium mb-2 text-xs opacity-50">Can you clearly read the text below?</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  ISHIHARA-SCREEN-2026
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-700 leading-relaxed">
              <strong>Instructions:</strong> For each plate, you will see a number. Type the number you see. If you see nothing, click "Nothing". Be prepared for a quick flow (approx. 3-5 seconds per plate).
            </div>

            <button
              onClick={startTest}
              className="btn-primary w-full"
              aria-label="Confirm environment check and start test"
            >
              I'm Ready
            </button>
          </div>
        )}

        {screen === 'test' && (
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="relative">
                <IshiharaPlate config={currentPlate} sessionSeed={sessionSeed} />
                {/* Soft Timer Hint - purely visual, non-punitive */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-2 bg-slate-200 rounded-full overflow-hidden shadow-sm">
                  <div
                    className="h-full bg-secondary"
                    key={`timer-${currentPlateIndex}`}
                    style={{ width: '100%', animation: 'timer-drain 3s forwards linear' }}
                  />
                </div>
              </div>

              <div className="text-center md:hidden">
                <div className="text-3xl font-mono font-bold text-primary min-h-[40px] bg-slate-100 rounded-lg inline-block px-6 py-2">
                  {inputBuffer === 'none' ? 'Nothing' : inputBuffer || '—'}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="hidden md:block text-center space-y-4">
                <h3 className="text-slate-500 font-medium uppercase tracking-wider text-sm">Your Response</h3>
                <div className="text-6xl font-mono font-bold text-primary min-h-[80px] bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200">
                  {inputBuffer === 'none' ? 'Nothing' : inputBuffer || '—'}
                </div>
              </div>

              <NumericKeypad
                onInput={handleInput}
                onClear={() => setInputBuffer('')}
                onDelete={() => setInputBuffer(prev => prev.slice(0, -1))}
                onNothing={handleNothing}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}

        {screen === 'results' && (
          <div className="max-w-2xl w-full glass p-10 rounded-3xl space-y-8 text-center animate-fade-in">
            {getClassification().icon}

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Screening Complete</h2>
              <div className={`text-xl font-bold ${getClassification().color}`}>
                Diagnosis: {getClassification().label}
              </div>
              <div className="text-lg font-bold text-slate-500">
                Test result: {Math.round((responses.filter(r => r.isCorrect).length / (responses.length || 1)) * 100)}% ({responses.filter(r => r.isCorrect).length}/{responses.length})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl font-bold">{responses.filter(r => r.isCorrect).length}/{responses.length}</div>
                <div className="text-slate-500 text-sm">Total Correct</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-3xl font-bold">
                  {(responses.reduce((acc, r) => acc + r.responseTimeMs, 0) / (responses.length || 1) / 1000).toFixed(1)}s
                </div>
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

            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <ShieldCheck size={20} />
                Next Steps & Recommendations
              </div>
              <p className="text-amber-800/80 text-sm leading-relaxed">
                {getClassification().label === 'Inconclusive'
                  ? "We couldn't determine a clear result. Please ensure you are in a well-lit area, your screen is bright, and you answer each plate within 3-5 seconds."
                  : responses.filter(r => r.isCorrect).length === responses.length
                    ? "Your color vision appears normal. We recommend regular eye check-ups as part of your overall health routine."
                    : "We detected some discrepancies in your color perception. This could indicate a level of color vision deficiency. We strongly recommend consulting an eye care professional for a formal clinical diagnosis."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1"
                aria-label="Take the test again"
              >
                Retake Test
              </button>
              <button
                className="btn-primary flex-1 !py-4"
                onClick={() => {
                  trackEvent('consultation_cta_clicked');
                  window.open('https://www.icicilombard.com/cashless-hospitals', '_blank');
                }}
              >
                Find Professional Help
              </button>
            </div>

            <div className="text-[10px] text-slate-400 leading-tight">
              ICICI Lombard General Insurance Company Limited. This screening tool is for educational purposes only. Diagnostic accuracy depends on display quality and environment.
            </div>
          </div>
        )}

      </main>

      <footer className="py-8 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">© 2026 ICICI Lombard Vision POC</div>
          <div className="text-slate-300 text-[9px] uppercase tracking-widest whitespace-nowrap">
            Professional Screening • Privacy Protected • Clinical Grade Engine
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple Clock component missing from lucide
const Clock = ({ className, size }: { className?: string, size?: number }) => (
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
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default App;
