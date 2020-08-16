/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ReactTooltip from 'react-tooltip';
import { useFavicon } from 'react-use';

import notify from '../../services/toast';

import languageColors from '../../utils/language-colors';

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

  // https://api.github.com/repos/leoronne/twitter-ui-clone

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
        setLanguages(Object.keys(languages));

        const pullsResponse = await api.get(`repos/${username}/${reponame}/pulls`);
        const pulls = pullsResponse.data;
        setPulls(pulls.length > 0 ? pulls.length : 0);

        const issuesResponse = await api.get(`repos/${username}/${reponame}/issues`);
        const issues = issuesResponse.data;
        setIssues(issues.length > 0 ? issues.length : 0);

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
    // Promise.all([
    //   fetch(`https://api.github.com/repos/${username}/${reponame}`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/commits`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/releases`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/languages`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/pulls`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/issues`),
    //   fetch(`https://api.github.com/repos/${username}/${reponame}/contributors`),
    // ]).then(async responses => {
    //   const [repoResponse, commitsResponse, releasesResponse, languagesResponse, pullsResponse, issuesResponse, contributorsResponse] = responses;
    //   if (repoResponse?.status === 404) {
    //     setData({ error: 'Repository not found!' });
    //     return;
    //   }

    //   const repo = await repoResponse.json();
    //   const commits = await commitsResponse.json();

    //   if (commitsResponse?.status === 409) {
    //     setData({ repo });
    //     setEmptyRepo(true);
    //     throw new Error('Repository is empty!');
    //   }

    //   const releases = await releasesResponse.json();
    //   const languages = await languagesResponse.json();
    //   const pulls = await pullsResponse.json();
    //   const issues = await issuesResponse.json();
    //   const contributors = await contributorsResponse.json();

    //   const shuffledContributors = contributors.sort(() => 0.5 - Math.random());
    //   const slicedContributors = shuffledContributors.slice(0, 10);
    //   setLanguages(Object.keys(languages));
    //   setReleases(releases);
    //   setPulls(pulls.length > 0 ? pulls.length : 0);
    //   setIssues(issues.length > 0 ? issues.length : 0);
    //   setContributors(slicedContributors);
    //   setCommits(commits);
    //   setData({ repo });
    // });
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
              <b>{data.repo.subscribers_count}</b>
            </li>
            <li
              data-tip={`This repository has ${data.repo.stargazers_count} stars`}
              onClick={() => window.open(`https://github.com/${username}/${reponame}/stargazers`, 'blank')}
              role="link"
            >
              <StarIcon />
              <span>Star</span>
              <b>{data.repo.stargazers_count}</b>
            </li>
            <li
              data-tip={`This repository was forked by ${data.repo?.fork && data.repo?.parent?.forks_count ? data.repo.parent.forks_count : data.repo.forks} users`}
              onClick={() => window.open(`https://github.com/${username}/${reponame}/network/members`, 'blank')}
              role="link"
            >
              <ForkIcon />
              <span>Fork</span>
              <b>{data.repo?.fork && data.repo?.parent?.forks_count ? data.repo.parent.forks_count : data.repo.forks}</b>
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
                  {/* {repoCommits[0]?.author?.avatar_url && <img src={repoCommits[0].author.avatar_url} alt={repoCommits[0].author.login} />}
                  {repoCommits[0]?.author?.login && <span className="user">{repoCommits[0].author.login}</span>}
                  {repoCommits[0]?.commit?.message && <span className="message">{repoCommits[0].commit.message}</span>} */}
                  <img src="https://avatars0.githubusercontent.com/u/10172199?v=4" alt="Leonardo Ronne" />
                  <span className="user">leoronne</span>
                  <span className="message">Mensagem teste</span>
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

              <ul className="languages">
                {repoLanguages.map((language, index) => (
                  <li key={index}>
                    <LanguageDot color={getLanguageColor(language)} />
                    <span>{language}</span>
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
