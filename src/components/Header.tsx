import React from 'react';
import { Eye } from 'lucide-react';
import { Screen } from '../types';

interface HeaderProps {
    screen: Screen;
    onLogoClick: () => void;
    currentPlateIndex: number;
    totalPlates: number;
}

const Header: React.FC<HeaderProps> = ({ screen, onLogoClick, currentPlateIndex, totalPlates }) => {
    return (
        <header className="py-6 px-4 flex justify-between items-center max-w-4xl mx-auto w-full border-b border-slate-100 mb-4">
            <button
                onClick={() => onLogoClick()}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
                aria-label="Go to home screen"
            >
                <div className="bg-primary p-2 rounded-lg">
                    <Eye className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight text-primary">
                    Wow<span className="text-secondary">Vision</span>
                </span>
            </button>
            {screen === 'test' && (
                <div className="text-sm font-medium text-slate-500">
                    Plate {currentPlateIndex + 1} of {totalPlates}
                </div>
            )}
        </header>
    );
};

export default Header;
