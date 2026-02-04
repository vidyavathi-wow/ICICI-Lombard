import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PrecheckPage from './pages/PrecheckPage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import { useColorVisionTest } from './hooks/useColorVisionTest';

const App: React.FC = () => {
  const {
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
  } = useColorVisionTest();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        screen={screen}
        onLogoClick={resetTest}
        currentPlateIndex={currentPlateIndex}
        totalPlates={sessionPlates.length}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {screen === 'landing' && (
          <LandingPage onStart={() => setScreen('precheck')} />
        )}

        {screen === 'precheck' && (
          <PrecheckPage
            onConfirm={startTest}
            onBack={navigateBack}
          />
        )}

        {screen === 'test' && (
          <TestPage
            currentPlate={currentPlate}
            currentPlateIndex={currentPlateIndex}
            sessionSeed={sessionSeed}
            inputBuffer={inputBuffer}
            onInput={handleInput}
            onClear={() => setInputBuffer('')}
            onDelete={() => setInputBuffer(prev => prev.slice(0, -1))}
            onNothing={handleNothing}
            onSubmit={handleSubmit}
            onBack={navigateBack}
          />
        )}

        {screen === 'results' && (
          <ResultsPage
            responses={responses}
            sessionPlates={sessionPlates}
            trackEvent={trackEvent}
            onBack={navigateBack}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
