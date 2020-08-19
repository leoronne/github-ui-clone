/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Container, GithubLogo, SearchForm, MoonIcon, SunIcon, SearchIcon } from './styles';

import { ThemeName } from '../../styles/themes';

interface Props {
  themeName: ThemeName;
  setThemeName: (newName: ThemeName) => void;
}

const Header: React.FC<Props> = ({ themeName, setThemeName }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    navigate(`/${search.toLowerCase().trim()}`);
  }

  function toggleTheme() {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
    localStorage.setItem('@Github:theme', themeName === 'light' ? 'dark' : 'light');
  }

  return (
    <Container>
      <a href="/">
        <GithubLogo data-tip="Go to homepage" />
      </a>
      <SearchForm onSubmit={handleSubmit}>
        <input placeholder="Search username" value={search} onChange={e => setSearch(e.currentTarget.value)} data-tip="Inform an username and press enter" />
        <button type={search ? 'submit' : 'button'} data-tip="Search username on GitHub">
          <SearchIcon />
        </button>
      </SearchForm>
      <div className="theme" data-tip={`Activate ${themeName === 'light' ? 'Dark' : 'Light'} Mode`}>
        {themeName === 'light' ? <MoonIcon onClick={toggleTheme} /> : <SunIcon onClick={toggleTheme} />}
      </div>
    </Container>
  );
};

export default Header;
