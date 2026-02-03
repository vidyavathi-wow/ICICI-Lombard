import React, { useEffect, useRef } from 'react';
import { generatePlate, PlateConfig } from '../utils/plateGenerator';

interface IshiharaPlateProps {
    config: PlateConfig;
    sessionSeed: string;
}

const IshiharaPlate: React.FC<IshiharaPlateProps> = ({ config, sessionSeed }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Use combination of sessionSeed and number to make it stable but unique per session
            generatePlate(canvasRef.current, config, `${sessionSeed}-${config.number}`);
        }
    }, [config, sessionSeed]);

    return (
        <div className="ishihara-container animate-fade-in">
            <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full h-full"
            />
        </div>
    );
};

export default IshiharaPlate;
