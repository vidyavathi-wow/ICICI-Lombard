import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-8 px-4 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto text-center space-y-2">
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    © 2026 Wow Vision
                </div>
                <div className="text-slate-300 text-[9px] uppercase tracking-widest leading-relaxed">
                    Professional Screening • Privacy Protected • Clinical Grade Engine
                </div>
            </div>
        </footer>
    );
};

export default Footer;
