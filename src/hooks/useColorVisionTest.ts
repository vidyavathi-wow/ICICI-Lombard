import { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PLATE_CATALOG } from '../constants/plates';
import { Screen, Response } from '../types';

export const useColorVisionTest = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [sessionSeed] = useState(() => uuidv4());
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [testStartedAt, setTestStartedAt] = useState<number>(0);

  const trackEvent = useCallback((name: string, properties: any = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[Analytics] ${name}`, { ...properties, sessionSeed, timestamp });
  }, [sessionSeed]);

  const sessionPlates = useMemo(() => {
    const demo = PLATE_CATALOG.filter(p => p.type === 'demonstration');
    const diagnostic = PLATE_CATALOG.filter(p => p.type !== 'demonstration');

    const lastSessionPlates = JSON.parse(localStorage.getItem('last_test_plates') || '[]');
    let pool = diagnostic;
    if (diagnostic.length > 20) {
      pool = diagnostic.filter(p => !lastSessionPlates.includes(p.plate_id));
      if (pool.length < 11) pool = diagnostic;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = [...demo, ...shuffled].slice(0, 12);

    return selected;
  }, []);

  const currentPlate = sessionPlates[currentPlateIndex];

  const handleSubmit = useCallback(() => {
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

    setResponses(prev => [...prev, newResponse]);
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
  }, [currentPlate, currentPlateIndex, inputBuffer, responses.length, sessionPlates, startTime, testStartedAt, trackEvent]);

  const startTest = () => {
    localStorage.setItem('last_test_plates', JSON.stringify(sessionPlates.map(p => p.plate_id)));

    trackEvent('precheck_completed', {
      brightness_confirmed: true,
      night_mode_off_confirmed: true,
      device_ua: navigator.userAgent
    });
    setScreen('test');
    setStartTime(Date.now());
    setTestStartedAt(Date.now());

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

  const handleInput = (val: string) => {
    if (inputBuffer.length < 2) {
      setInputBuffer(prev => prev + val);
    }
  };

  const handleNothing = () => {
    setInputBuffer('none');
    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  useEffect(() => {
    if (screen === 'test' && inputBuffer !== '' && inputBuffer !== 'none' && inputBuffer.length === currentPlate.number.length) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inputBuffer, currentPlate, screen, handleSubmit]);

  useEffect(() => {
    trackEvent('test_landing_viewed');

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
  }, [screen, currentPlateIndex, sessionPlates.length, trackEvent]);

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
  }, [screen, inputBuffer, currentPlateIndex, handleSubmit]);

  const resetTest = useCallback(() => {
    setCurrentPlateIndex(0);
    setInputBuffer('');
    setResponses([]);
    setScreen('landing');
  }, []);

  const navigateBack = useCallback(() => {
    if (screen === 'precheck') setScreen('landing');
    else if (screen === 'test') {
      setCurrentPlateIndex(0);
      setResponses([]);
      setScreen('precheck');
    }
    else if (screen === 'results') {
      resetTest();
    }
  }, [screen, resetTest]);

  return {
    screen,
    setScreen,
    sessionSeed,
    currentPlateIndex,
    inputBuffer,
    setInputBuffer,
    responses,
    sessionPlates,
    currentPlate,
    startTest,
    handleInput,
    handleNothing,
    handleSubmit,
    trackEvent,
    resetTest,
    navigateBack
  };
};
