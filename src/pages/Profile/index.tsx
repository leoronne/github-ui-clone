import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import ReactTooltip from 'react-tooltip';

import { Container, Main, LeftSide, RightSide, Repos, CalendarHeading, RepoIcon, OverViewIcon, ProjectsIcon, PackagesIcon, Tab, Loader } from './styles';

import ProfileData from '../../components/ProfileData';
import RepoCard from '../../components/RepoCard';
import RandomCalendar from '../../components/RandomCalendar';
import Error404 from '../../components/Error404';

import { APIUser, APIRepo } from '../../@types';
import api from '../../services/api';
import notify from '../../services/toast';

interface Data {
  user?: APIUser;
  repos?: APIRepo[];
  error?: string;
}

const Profile: React.FC = () => {
  const { username = 'leoronne' } = useParams();
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

        const reposResponse = await api.get(`users/${username}/repos`);
        const repos = reposResponse.data;
        setRepos(repos);

        const orgsResponse = await api.get(`users/${username}/orgs`);
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

    // Promise.all([
    //   fetch(`https://api.github.com/users/${username}`),
    //   fetch(`https://api.github.com/users/${username}/repos`),
    //   fetch(`https://api.github.com/users/${username}/orgs`),
    // ]).then(async responses => {
    //   const [userResponse, reposResponse, orgsResponse] = responses;

    //   if (userResponse?.status === 404) {
    //     setData({ error: 'User not found!' });
    //     return;
    //   }

    //   const user = await userResponse.json();
    //   const repos = await reposResponse.json();
    //   const orgs = await orgsResponse.json();
    //   setRepos(repos);
    //   setOrgs(orgs);

    //   const shuffledRepos = repos.sort(() => 0.5 - Math.random());
    //   const slicedRepos = shuffledRepos.slice(0, 6); // 6 repos

    //   setData({
    //     user,
    //     repos: slicedRepos,
    //   });
    // });
  }, [username]);

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
        <span className="number">{data.user?.public_repos}</span>
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
                <h2>Random Repositories</h2>

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
                {`${Math.floor(Math.random() * (2000 - 1)) + 1} contributions in the last year`}
              </CalendarHeading>

              <RandomCalendar />
            </>
          ) : (
            <>
              <Repos>
                <h2>Repositories</h2>

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
