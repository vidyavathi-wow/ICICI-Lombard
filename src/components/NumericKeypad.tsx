import React from 'react';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
    onInput: (val: string) => void;
    onClear: () => void;
    onDelete: () => void;
    onNothing: () => void;
    onSubmit: () => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
    onInput,
    onClear,
    onDelete,
    onNothing,
    onSubmit
}) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Nothing', '0', 'delete'];

    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto mt-6 md:mt-8">
            {keys.map((key) => {
                if (key === 'Nothing') {
                    return (
                        <button
                            key={key}
                            onClick={onNothing}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium py-3 rounded-xl transition-all active:scale-[0.98] text-sm border border-slate-200/50"
                            aria-label="I cannot see anything or the plate is blank"
                        >
                            Nothing
                        </button>
                    );
                }
                if (key === 'delete') {
                    return (
                        <button
                            key={key}
                            onClick={onDelete}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center py-3 rounded-xl transition-all active:scale-[0.98] border border-slate-200/50"
                            aria-label="Delete last digit"
                        >
                            <Delete size={20} />
                        </button>
                    );
                }
                return (
                    <button
                        key={key}
                        onClick={() => onInput(key)}
                        className="bg-white border border-slate-200 hover:border-primary/50 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-sm hover:shadow-md text-xl"
                        aria-label={`Enter number ${key}`}
                    >
                        {key}
                    </button>
                );
            })}
            <button
                onClick={onSubmit}
                className="col-span-3 bg-primary hover:bg-primary-light text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 mt-2"
                aria-label="Submit answer and go to next plate"
            >
                Next Plate
            </button>
        </div>
    );
};

export default NumericKeypad;
