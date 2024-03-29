/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */


import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../../Hooks/useStores';

import Reviewer from './Reviewers/Reviewer';
import Search from './Reviewers/Search';

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    width: '100%'
  },
  fetchingLabel: {
    position: 'relative !important',
    padding: '15px 0 0 0',
    background: 'transparent',
    border: 0,
    textAlign: 'left',
    fontSize: '1rem'
  },
  panel: {
    position: 'relative',
    width: '100%'
  },
  title: {
    fontSize: '1.0285em',
    fontWeight: 'bold'
  },
  reviewers: {
    '& h4': {
      padding: '0 25px'
    },
    '& ul': {
      display: 'block',
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      '& li': {
        width: '100%',
        margin: '6px 0',
        padding: 0
      }
    }
  }
});

interface ReviewersProps {
  id: string;
}

const Reviewers = observer(({ id }: ReviewersProps) => {

  const classes = useStyles();

  const { userProfileStore, invitedUsersStore } = useStores();

  useEffect(() => {
    invitedUsersStore.getInvitedUsers(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInstanceReviews = () => invitedUsersStore.getInvitedUsers(id);

  const handleRemoveUserInvitation = (userId: string) => invitedUsersStore.removeUserInvitation(id, userId);

  const handleInviteUser = (userId: string) => invitedUsersStore.inviteUser(id, userId);

  const excludedUsers = invitedUsersStore.users.map(review => review.id);
  if (userProfileStore.isAuthorized && userProfileStore.user && userProfileStore.user.id && !excludedUsers.includes(userProfileStore.user.id)) {
    excludedUsers.push(userProfileStore.user.id);
  }

  if(invitedUsersStore.isFetching) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <div>
          <FontAwesomeIcon icon={faCircleNotch} spin/>
          <span className={classes.fetchingLabel}>&nbsp;&nbsp;
          Retrieving reviewers...
          </span>
        </div>
      </div>
    );
  }

  if(invitedUsersStore.hasFetchError) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle}style={{color: 'var(--ft-color-error)'}}/>&nbsp;&nbsp;<small>{invitedUsersStore.fetchError}</small>
          &nbsp;&nbsp;<FontAwesomeIcon icon={faRedoAlt} style={{cursor: 'pointer'}} title="retry" onClick={fetchInstanceReviews}/>
        </div>
      </div>
    );
  }

  if(invitedUsersStore.error) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle}style={{color: 'var(--ft-color-error)'}}/>&nbsp;&nbsp;<small>{invitedUsersStore.error}</small>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h5 className={classes.title}>Reviewers:</h5>
      <div className={classes.panel}>
        <div className={classes.reviewers} >
          <ul>
            {invitedUsersStore.users.map(review => (
              <li key={review.id}>
                <Reviewer review={review} onRemoveInvitation={handleRemoveUserInvitation} />
              </li>
            ))}
          </ul>
        </div>
        <Search onSelect={handleInviteUser} excludedUsers={excludedUsers} />
      </div>
    </div>
  );
});
Reviewers.displayName = 'Reviewers';

export default Reviewers;