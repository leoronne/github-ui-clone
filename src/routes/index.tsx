import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from '../components/Header';
import Profile from '../pages/Profile';
import Repo from '../pages/Repo';
import Footer from '../components/Footer';

import { ThemeName } from '../styles/themes';

interface RoutesProps {
  theme: ThemeName;
  onChange: (newName: ThemeName) => void;
}

const RoutesList: React.FC<RoutesProps> = ({ theme, onChange }) => (
  <>
    <div className="container">
      <Header themeName={theme} setThemeName={onChange} />
      <div className="main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/:username/:reponame" element={<Repo />} />
        </Routes>
        <Footer />
      </div>
    </div>
  </>
);

export default RoutesList;
