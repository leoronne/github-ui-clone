/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';

import {
  Container,
  Flex,
  Avatar,
  Row,
  PeopleIcon,
  Column,
  CompanyIcon,
  LocationIcon,
  EmailIcon,
  BlogIcon,
  TwitterIcon,
  Organizations,
  OrganizationsContainer,
  OrganizationCard,
} from './styles';
import kFormatter from '../../utils/kFormatter';

interface Orgs {
  login?: string;
  id?: number;
  node_id?: string;
  url?: string;
  repos_url?: string;
  events_url?: string;
  hooks_url?: string;
  issues_url?: string;
  members_url?: string;
  public_members_url?: string;
  avatar_url?: string;
  description?: string;
}

interface Props {
  username: string;
  type?: string;
  name: string;
  avatarUrl: string;
  followers: number;
  following: number;
  company?: string;
  location?: string;
  email?: string;
  blog?: string;
  bio?: string;
  twitter?: string;
  orgs?: Array<Orgs>;
}

const ProfileData: React.FC<Props> = ({ username, type, name, avatarUrl, followers, following, company, location, email, blog, bio, twitter, orgs }) => {
  return (
    <Container>
      <Flex>
        <Avatar src={avatarUrl} alt={username} data-tip="Go to user's GitHub profile" onClick={() => window.open(`https://github.com/${username}`, 'blank')} />

        <div>
          <h1>{name}</h1>

          <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer" data-tip="Go to user's GitHub profile">
            <h2>{username}</h2>
          </a>
          <p>{bio}</p>
        </div>
      </Flex>

      {type !== 'Organization' && (
        <Row>
          <li className="link-li" onClick={() => window.open(`https://github.com/${username}?tab=followers`, '_blank')} data-tip="Go to user's followers">
            <PeopleIcon />
            <b>{kFormatter(followers)}</b>
            <span>followers</span>
            <span>·</span>
          </li>

          <li className="link-li" onClick={() => window.open(`https://github.com/${username}?tab=following`, '_blank')} data-tip="Go to user's followings">
            <b>{kFormatter(following)}</b>
            <span>following</span>
          </li>
        </Row>
      )}

      <Column>
        {company && (
          <li>
            <CompanyIcon />
            <span>{company}</span>
          </li>
        )}
        {location && (
          <li>
            <LocationIcon />
            <span>{location}</span>
          </li>
        )}
        {email && (
          <li>
            <EmailIcon />
            <span>{email}</span>
          </li>
        )}
        {blog && (
          <li>
            <BlogIcon />
            <span>
              <a href={blog} target="_blank" rel="noopener noreferrer" data-tip="Go to user's blog">
                {blog}
              </a>
            </span>
          </li>
        )}
        {twitter && (
          <li>
            <TwitterIcon />
            <span>
              <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer" data-tip="Go to user's Twitter profile">
                {`@${twitter}`}
              </a>
            </span>
          </li>
        )}
      </Column>
      {orgs && orgs?.length > 0 && (
        <Organizations>
          <h5>Organizations</h5>
          <OrganizationsContainer>
            {orgs.map(org => (
              <OrganizationCard key={org?.login}>
                <a href={`https://github.com/${org.login}`} target="_blank" rel="noopener noreferrer" data-tip={`Go to ${org.login}`}>
                  <img src={org?.avatar_url} alt={org.login} />
                </a>
              </OrganizationCard>
            ))}
          </OrganizationsContainer>
        </Organizations>
      )}
    </Container>
  );
};

export default ProfileData;
