/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-indent */
import React from 'react';
import { Link } from 'react-router-dom';

import languageColors from '../../utils/language-colors';

import { Container, Topside, RepoIcon, Botside, StarIcon, ForkIcon, LanguageDot } from './styles';
import kFormatter from '../../utils/kFormatter';

interface Props {
  username: string;
  reponame: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  isForked?: boolean;
}

const RepoCard: React.FC<Props> = ({ username, reponame, description, language, stars, forks, isForked }) => {
  const languageName = language ? language.replace(' ', '-').toLowerCase() : 'other';
  const languageColor = languageColors[languageName];
  return (
    <Container>
      <Topside>
        <header>
          {isForked ? <ForkIcon /> : <RepoIcon />}
          <Link to={`/${username}/${reponame}`} data-tip={`Go to ${reponame}`}>
            {reponame}
          </Link>
        </header>
        <p>{description}</p>
      </Topside>

      <Botside>
        <ul>
          {language && (
            <li data-tip={`Repository main language: ${language}`}>
              <LanguageDot color={languageColor || '#8257e5'} />
              <span>{language}</span>
            </li>
          )}
          {stars && stars > 0 ? (
            <li data-tip={`Repository has ${stars} stars`}>
              <StarIcon />
              <span>{kFormatter(stars)}</span>
            </li>
          ) : null}
          {forks && forks > 0 ? (
            <li data-tip={`Repository was forked by ${forks} users`}>
              <ForkIcon />
              <span>{kFormatter(forks)}</span>
            </li>
          ) : null}
        </ul>
      </Botside>
    </Container>
  );
};

export default RepoCard;
