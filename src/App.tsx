// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import JoinRoom from './components/JoinRoom';
import GameRoom from './components/GameRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
