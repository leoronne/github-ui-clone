/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ReactTooltip from 'react-tooltip';
import { useFavicon } from 'react-use';

import notify from '../../services/toast';

import languageColors from '../../utils/language-colors';
import kFormatter from '../../utils/kFormatter';

import Error404 from '../../components/Error404';

import {
  Container,
  Breadcrumb,
  Tabs,
  RepoIcon,
  Stats,
  StarIcon,
  ForkIcon,
  ActionsIcon,
  CodeIcon,
  InsightsIcon,
  PullRequestIcon,
  WikiIcon,
  SecurityIcon,
  SettingsIcon,
  ProjectsIcon,
  // LinkButton,
  // GithubIcon,
  WatchIcon,
  Loader,
  Header,
  HeaderInfo,
  ForkedInfo,
  RepoInformation,
  RightSide,
  RepoInfoHeader,
  Row,
  LanguageDot,
  TagIcon,
  ReleaseInfo,
  Contributors,
  ContributorsCard,
  IssuesIcon,
  CommitsIcon,
  CheckIcon,
  HorizontalBar,
  LanguageBar,
} from './styles';

import { APIRepo } from '../../@types';
import api from '../../services/api';

interface Data {
  repo?: APIRepo;
  error?: string;
}

interface Releases {
  name?: string;
  tag_name?: string;
  published_at?: string;
}

interface Commits {
  sha?: string;
  author?: {
    login?: string;
    avatar_url?: string;
  };
  commit?: {
    author?: {
      date?: string;
    };
    message?: string;
  };
}

const Repo: React.FC = () => {
  const { username, reponame } = useParams();
  const [data, setData] = useState<Data>();
  const [repoLanguages, setLanguages] = useState([]);
  const [repoReleases, setReleases] = useState<Array<Releases>>([]);
  const [repoPulls, setPulls] = useState(0);
  const [repoIssues, setIssues] = useState(0);
  const [repoContributors, setContributors] = useState([]);
  const [repoCommits, setCommits] = useState<Array<Commits>>([]);
  const [emptyRepo, setEmptyRepo] = useState(false);
  const [loading, setLoading] = useState(true);

  useFavicon(`${window.location.origin}/favicon.ico`);

  const sumValues = obj => Object.values(obj).reduce((a: number, b: number) => a + b);
  const getPercentageValue = (value: number, total: number) => {
    const percentage = (value * 100) / total;
    return percentage.toFixed(2);
  };

  useEffect(() => {
    async function loadRepoInfo() {
      setLoading(true);
      try {
        const repoResponse = await api.get(`repos/${username}/${reponame}`);
        const repo = repoResponse.data;
        setData({ repo });

        const commitsResponse = await api.get(`repos/${username}/${reponame}/commits`);
        const commits = commitsResponse.data;
        setCommits(commits);

        const releasesResponse = await api.get(`repos/${username}/${reponame}/releases`);
        const releases = releasesResponse.data;
        setReleases(releases);

        const languagesResponse = await api.get(`repos/${username}/${reponame}/languages`);
        const languages = languagesResponse.data;
        if (languages !== {}) {
          const allMb = sumValues(languages);
          const languageKeys = Object.keys(languages);
          const calculatedLanguages = languageKeys.map(lang => {
            return { language: lang, percentage: getPercentageValue(languages[lang], Number(allMb)) };
          });
          if (calculatedLanguages.length > 7) {
            const mainLanguages = calculatedLanguages.slice(0, 6); // 6 languages
            const slicedLanguages = calculatedLanguages.slice(6, calculatedLanguages.length); // other languages
            let remainingValues = 0;
            slicedLanguages.forEach(lng => {
              remainingValues += Number(lng.percentage);
            });
            mainLanguages.push({ language: 'Other', percentage: String(remainingValues) });
            setLanguages(mainLanguages);
          } else setLanguages(calculatedLanguages);
        }

        const pullsResponse = await api.get(`repos/${username}/${reponame}/pulls?per_page=100`);
        const pulls = pullsResponse.data;
        setPulls(pulls.length > 0 ? pulls.length : 0);

        // const issuesResponse = await api.get(`repos/${username}/${reponame}/issues?per_page=100`);
        // const issues = issuesResponse.data;
        setIssues(repo.open_issues > 0 ? repo.open_issues - (pulls.length > 0 ? pulls.length : 0) : repo.open_issues);

        const contributorsResponse = await api.get(`repos/${username}/${reponame}/contributors`);
        const contributors = contributorsResponse.data;
        const shuffledContributors = contributors.sort(() => 0.5 - Math.random());
        const slicedContributors = shuffledContributors.slice(0, 10);
        setContributors(slicedContributors);
      } catch (err) {
        const error = err?.response?.data?.message ? err.response.data.message : err.message;
        switch (error) {
          case 'Not Found':
            setData({ error: 'Repository not found!' });
            break;
          case 'Git Repository is empty.':
            setEmptyRepo(true);
            break;
          default:
            break;
        }
        notify(error, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRepoInfo();
  }, [reponame, username]);

  function getLanguageColor(language) {
    const languageName = language ? language.replace(' ', '-').toLowerCase() : 'other';
    return languageColors[languageName];
  }

  function getReleaseDate(date) {
    const dateStr = new Date(Date.parse(date));
    return dateStr.toDateString();
  }

  const TabContent = () => (
    <>
      <div className="content active" role="button" data-tip="Repository's Code page" onClick={() => window.open(`https://github.com/${username}/${reponame}`, 'blank')}>
        <CodeIcon />
        <span className="label">Code</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Issues page" onClick={() => window.open(`https://github.com/${username}/${reponame}/issues`, 'blank')}>
        <IssuesIcon />
        <span className="label">Issues</span>
        {repoIssues > 0 && <span className="number">{repoIssues}</span>}
      </div>
      <div className="content" role="button" data-tip="Repository's Pull requests page" onClick={() => window.open(`https://github.com/${username}/${reponame}/pulls`, 'blank')}>
        <PullRequestIcon />
        <span className="label">Pull requests</span>
        {repoPulls > 0 && <span className="number">{repoPulls}</span>}
      </div>
      <div className="content" role="button" data-tip="Repository's Actions page" onClick={() => window.open(`https://github.com/${username}/${reponame}/actions`, 'blank')}>
        <ActionsIcon />
        <span className="label">Actions</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Projects page" onClick={() => window.open(`https://github.com/${username}/${reponame}/projects`, 'blank')}>
        <ProjectsIcon />
        <span className="label">Projects</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Wiki page" onClick={() => window.open(`https://github.com/${username}/${reponame}/wiki`, 'blank')}>
        <WikiIcon />
        <span className="label">Wiki</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Security page" onClick={() => window.open(`https://github.com/${username}/${reponame}/security`, 'blank')}>
        <SecurityIcon />
        <span className="label">Security</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Insights page" onClick={() => window.open(`https://github.com/${username}/${reponame}/pulse`, 'blank')}>
        <InsightsIcon />
        <span className="label">Insights</span>
      </div>
      <div className="content" role="button" data-tip="Repository's Settings page" onClick={() => window.open(`https://github.com/${username}/${reponame}/settings`, 'blank')}>
        <SettingsIcon />
        <span className="label">Settings</span>
      </div>
    </>
  );

  if (loading) {
    return (
      <Container id="main-profile">
        <Loader>
          <ClipLoader size={25} color="#6a737d" />
        </Loader>
      </Container>
    );
  }

  if (data?.error || !data?.repo) {
    return (
      <>
        <Error404 />
      </>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderInfo>
          <Breadcrumb>
            {data.repo?.fork ? <ForkIcon /> : <RepoIcon />}

            <div className="repo-credentials">
              <Link className="username" to={`/${username}`}>
                {username}
              </Link>

              <span>/</span>
              <a href={`https://github.com/${username}/${reponame}`} target="_blank" rel="noopener noreferrer" className="reponame" data-tip="View repository on GitHub">
                {reponame}
              </a>
            </div>
          </Breadcrumb>

          <Stats>
            <li
              data-tip={`${data.repo.subscribers_count} users are watching this repository`}
              onClick={() => window.open(`https://github.com/${username}/${reponame}/watchers`, 'blank')}
              role="link"
            >
              <WatchIcon />
              <span>Watch</span>
              <b>{kFormatter(data.repo.subscribers_count)}</b>
            </li>
            <li
              data-tip={`This repository has ${data.repo.stargazers_count} stars`}
              onClick={() => window.open(`https://github.com/${username}/${reponame}/stargazers`, 'blank')}
              role="link"
            >
              <StarIcon />
              <span>Star</span>
              <b>{kFormatter(data.repo.stargazers_count)}</b>
            </li>
            <li
              data-tip={`This repository was forked by ${data.repo?.fork && data.repo?.parent?.forks_count ? data.repo.parent.forks_count : data.repo.forks} users`}
              onClick={() => window.open(`https://github.com/${username}/${reponame}/network/members`, 'blank')}
              role="link"
            >
              <ForkIcon />
              <span>Fork</span>
              <b>{data.repo?.fork && data.repo?.parent?.forks_count ? kFormatter(data.repo.parent.forks_count) : kFormatter(data.repo.forks)}</b>
            </li>
          </Stats>
        </HeaderInfo>

        <ForkedInfo>
          {data.repo?.fork && data.repo?.parent?.full_name ? (
            <>
              {`forked from `}
              <a href={`https://github.com/${data.repo.parent.full_name}`} target="_blank" rel="noopener noreferrer">
                {data.repo.parent.full_name}
              </a>
            </>
          ) : null}
        </ForkedInfo>
        <Tabs>
          <TabContent />
        </Tabs>
      </Header>

      <RepoInformation>
        <RightSide>
          <RepoInfoHeader>
            {emptyRepo ? (
              <div className="empty-repo">
                <span>Repository is empty</span>
              </div>
            ) : (
              <>
                <div className="commiter">
                  {repoCommits[0]?.author?.avatar_url && (
                    <a href={`/${repoCommits[0].author.login}`} data-tip={`Go to ${repoCommits[0].author.login} profile`} target="_blank" rel="noopener noreferrer">
                      <img src={repoCommits[0].author.avatar_url} alt={repoCommits[0].author.login} />
                    </a>
                  )}
                  {repoCommits[0]?.author?.login && (
                    <span className="user">
                      <a
                        href={`https://github.com/${username}/${reponame}/commits?author=${repoCommits[0]?.author?.login}`}
                        data-tip={`See commits from ${repoCommits[0].author.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {repoCommits[0].author.login}
                      </a>
                    </span>
                  )}
                  {repoCommits[0]?.commit?.message && (
                    <span className="message">
                      <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} target="_blank" rel="noopener noreferrer">
                        {repoCommits[0].commit.message}
                      </a>
                    </span>
                  )}
                </div>
                <div className="commiter-sha">
                  <CheckIcon />

                  <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} data-tip="See commit on GitHub" target="_blank" rel="noopener noreferrer">
                    {repoCommits[0].sha}
                  </a>
                </div>
                <div className="last-commit">
                  <a href={`https://github.com/${username}/${reponame}/commit/${repoCommits[0].sha}`} data-tip="See commit on GitHub" target="_blank" rel="noopener noreferrer">
                    {`on ${getReleaseDate(repoCommits[0]?.commit?.author?.date)}`}
                  </a>
                </div>
                <div className="number-commits">
                  <CommitsIcon />

                  <a href={`https://github.com/${username}/${reponame}/commits/master`} data-tip="See all commits on GitHub" target="_blank" rel="noopener noreferrer">
                    {`${repoCommits.length} commits`}
                  </a>
                </div>
              </>
            )}
          </RepoInfoHeader>

          {data.repo?.description && (
            <Row>
              <h4>About</h4>
              <p>{data.repo.description}</p>

              {/* <LinkButton href={data.repo.html_url}>
              <GithubIcon />
              <span>View on GitHub</span>
            </LinkButton> */}
            </Row>
          )}
          {repoLanguages.length > 0 && (
            <Row>
              <h4>Languages</h4>

              <HorizontalBar>
                {repoLanguages.map(lng => (
                  <LanguageBar color={getLanguageColor(lng.language)} size={lng.percentage} key={lng.language} />
                ))}
              </HorizontalBar>

              <ul className="languages">
                {repoLanguages.map((lng, index) => (
                  <li key={index}>
                    <LanguageDot color={getLanguageColor(lng.language)} />
                    <span>{`${lng.language}: ${lng.percentage}%`}</span>
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {repoReleases.length > 0 && (
            <Row>
              <h4>Releases</h4>

              <ReleaseInfo>
                <div className="tag-icon">
                  <TagIcon />
                </div>
                <div className="info">
                  <a
                    href={`https://github.com/${username}/${reponame}/releases/tag/${repoReleases[0].tag_name}`}
                    data-tip="See more details on GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h4>{repoReleases[0].name}</h4>
                    <span>{getReleaseDate(repoReleases[0].published_at)}</span>
                  </a>
                </div>
                <span className="latest">Latest</span>
              </ReleaseInfo>

              {repoReleases.length - 1 > 0 && (
                <a href={`https://github.com/${username}/${reponame}/releases`} target="_blank" rel="noopener noreferrer" className="link">
                  see more releases
                </a>
              )}
              <ReactTooltip place="bottom" type="dark" effect="solid" />
            </Row>
          )}
          {repoContributors.length > 0 && (
            <Row>
              <h4>Contributors</h4>

              <Contributors>
                {repoContributors.map(contributor => (
                  <ContributorsCard key={contributor?.login}>
                    <a href={`https://github.com/${contributor.login}`} target="_blank" rel="noopener noreferrer" data-tip={`Go to ${contributor.login}`}>
                      <img src={contributor?.avatar_url} alt={contributor.login} />
                    </a>
                  </ContributorsCard>
                ))}
              </Contributors>

              <a href={`https://github.com/${username}/${reponame}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className="link">
                see all contributors
              </a>
              <ReactTooltip place="bottom" type="dark" effect="solid" />
            </Row>
          )}
        </RightSide>

        {/* <LeftSide></LeftSide> */}
      </RepoInformation>
      <ReactTooltip place="bottom" type="dark" effect="solid" />
    </Container>
  );
};

export default Repo;
