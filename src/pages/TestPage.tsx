import React from 'react';
import IshiharaPlate from '../components/IshiharaPlate';
import NumericKeypad from '../components/NumericKeypad';
import { PlateConfig } from '../utils/plateGenerator';

interface TestPageProps {
    currentPlate: PlateConfig;
    currentPlateIndex: number;
    sessionSeed: string;
    inputBuffer: string;
    onInput: (val: string) => void;
    onClear: () => void;
    onDelete: () => void;
    onNothing: () => void;
    onSubmit: () => void;
    onBack: () => void;
}

const TestPage: React.FC<TestPageProps> = ({
    currentPlate,
    currentPlateIndex,
    sessionSeed,
    inputBuffer,
    onInput,
    onClear,
    onDelete,
    onNothing,
    onSubmit,
    onBack
}) => {
    return (
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
                    <div className="text-6xl font-mono font-bold text-primary min-h-[80px] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200">
                        {inputBuffer === 'none' ? 'Nothing' : inputBuffer || '—'}
                    </div>
                </div>

                <NumericKeypad
                    onInput={onInput}
                    onClear={onClear}
                    onDelete={onDelete}
                    onNothing={onNothing}
                    onSubmit={onSubmit}
                />

                <button
                    onClick={onBack}
                    className="w-full text-slate-400 hover:text-secondary text-xs font-medium transition-colors py-2"
                >
                    Cancel & Go Back
                </button>
            </div>
        </div>
    );
};

export default TestPage;
