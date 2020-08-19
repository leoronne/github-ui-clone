import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ReactTooltip from 'react-tooltip';

import { useTitle } from 'react-use';
import { Container, Main, LeftSide, RightSide, Repos, CalendarHeading, RepoIcon, OverViewIcon, ProjectsIcon, PackagesIcon, Tab, Loader } from './styles';

import ProfileData from '../../components/ProfileData';
import RepoCard from '../../components/RepoCard';
import RandomCalendar from '../../components/RandomCalendar';
import Error404 from '../../components/Error404';

import { APIUser, APIRepo } from '../../@types';
import api from '../../services/api';
import notify from '../../services/toast';
import kFormatter from '../../utils/kFormatter';

interface Data {
  user?: APIUser;
  repos?: APIRepo[];
  error?: string;
}

const Profile: React.FC = () => {
  const { username = 'facebook' } = useParams();
  const [data, setData] = useState<Data>();
  const [panelActive, setPanelActive] = useState(1);
  const [repositories, setRepos] = useState([]);
  const [organizations, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });

    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      window.addEventListener('resize', handleResize);

      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
  }
  const size = useWindowSize();

  useEffect(() => {
    const element = document.getElementById('main-content');
    const elementProfile = document.getElementById('main-profile');
    if (panelActive === 2) {
      element.style.height = 'calc(100% - 54px)';
    } else if (panelActive === 1) {
      if (size.height <= 968) {
        element.style.height = 'calc(100% - 54px)';
        if (elementProfile) elementProfile.style.height = 'auto';
      } else if (size.width >= 768) element.style.height = '100%';
    }
  }, [panelActive, size]);

  useEffect(() => {
    async function loadUserInfo() {
      setLoading(true);
      try {
        const userResponse = await api.get(`users/${username}`);
        const user = userResponse.data;

        const reposResponse = await api.get(`users/${username}/repos?per_page=100`);
        const repos = reposResponse.data;
        setRepos(repos);

        const orgsResponse = await api.get(`users/${username}/orgs?per_page=100`);
        const orgs = orgsResponse.data;
        setOrgs(orgs);

        const shuffledRepos = repos.sort(() => 0.5 - Math.random());
        const slicedRepos = shuffledRepos.slice(0, 6); // 6 repos

        setData({
          user,
          repos: slicedRepos,
        });
      } catch (err) {
        const error = err?.response?.data?.message ? err.response.data.message : err.message;
        setData({ error });
        notify(error, 'error');
      } finally {
        setLoading(false);
      }
    }
    setData({});
    loadUserInfo();
  }, [username]);

  useTitle(`GitHub UI Clone${loading || data?.error ? '' : ` | ${data.user.name}`}`);

  if (loading) {
    return (
      <Container panelActive={panelActive} id="main-profile">
        <Loader>
          <ClipLoader size={25} color="#6a737d" />
        </Loader>
      </Container>
    );
  }

  if (data?.error) {
    return (
      <>
        <Error404 />
      </>
    );
  }

  const TabContent = () => (
    <>
      <div className={`content ${panelActive === 1 ? ' active' : ''}`} onClick={() => setPanelActive(1)} role="button" data-tip="User's Overview page">
        <OverViewIcon />
        <span className="label">Overview</span>
      </div>
      <div className={`content ${panelActive === 2 ? ' active' : ''}`} onClick={() => setPanelActive(2)} role="button" data-tip="User's Repositories">
        <RepoIcon />
        <span className="label">Repositories</span>
        <span className="number">{kFormatter(data.user?.public_repos)}</span>
      </div>
      <div className="content" onClick={() => window.open(`https://github.com/${data.user.login}?tab=projects`, '_blank')} role="button" data-tip="Go to user's projects">
        <ProjectsIcon />
        <span className="label">Projects</span>
      </div>
      <div className="content" onClick={() => window.open(`https://github.com/${data.user.login}?tab=packages`, '_blank')} role="button" data-tip="Go to user's packages">
        <PackagesIcon />
        <span className="label">Packages</span>
      </div>
    </>
  );

  return (
    <Container panelActive={panelActive} id="main-profile">
      <Tab className="desktop">
        <div className="wrapper">
          <span className="offset" />
          <TabContent />
        </div>

        <span className="line" />
      </Tab>

      <Main>
        <LeftSide>
          <ProfileData
            type={data.user?.type}
            username={data.user.login}
            bio={data.user?.bio}
            name={data.user.name}
            avatarUrl={data.user.avatar_url}
            followers={data.user.followers}
            following={data.user.following}
            company={data.user.company}
            location={data.user.location}
            email={data.user.email}
            blog={data.user.blog}
            twitter={data.user?.twitter_username}
            orgs={organizations}
          />
        </LeftSide>

        <RightSide>
          <Tab className="mobile">
            <TabContent />
          </Tab>
          {panelActive === 1 ? (
            <>
              <Repos>
                <h2>{data?.repos.length > 0 ? 'Random Repositories' : 'User does not have any public repositories yet'}</h2>

                <div>
                  {data.repos.map(item => (
                    <RepoCard
                      key={item.name}
                      username={item.owner.login}
                      reponame={item.name}
                      description={item.description}
                      language={item.language}
                      stars={item.stargazers_count}
                      forks={item.forks}
                      isForked={item?.fork ? item?.fork : false}
                    />
                  ))}
                </div>
              </Repos>

              <CalendarHeading data-tip="Does not represent actual contribution data">
                {`${kFormatter(Math.floor(Math.random() * (2000 - 1)) + 1)} contributions in the last year`}
              </CalendarHeading>

              <RandomCalendar />
            </>
          ) : (
            <>
              <Repos>
                <h2>Repositories</h2>
                {data?.repos.length > 0 && (
                  <a
                    href={`https://github.com/${username}?tab=repositories`}
                    className="repo-link"
                    data-tip={`see all repositories from ${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    see all repositories
                  </a>
                )}
                <div>
                  {repositories.map(item => (
                    <RepoCard
                      key={item.name}
                      username={item.owner.login}
                      reponame={item.name}
                      description={item.description}
                      language={item.language}
                      stars={item.stargazers_count}
                      forks={item.forks}
                      isForked={item?.fork ? item?.fork : false}
                    />
                  ))}
                </div>
              </Repos>
            </>
          )}
        </RightSide>
      </Main>

      <ReactTooltip place="bottom" type="dark" effect="solid" />
    </Container>
  );
};

export default Profile;
