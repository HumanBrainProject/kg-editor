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


import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../../Hooks/UseStores";

import Reviewer from "./Reviewers/Reviewer";
import Search from "./Reviewers/Search";
import FetchingLoader from "../../../Components/FetchingLoader";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    "& .fetchingPanel": {
      position: "relative !important",
      padding: "15px 0 0 0",
      background: "transparent",
      border: 0,
      textAlign: "left",
      fontSize: "1rem"
    }
  },
  panel: {
    position: "relative",
    width: "100%"
  },
  title: {
    fontSize: "1.0285em",
    fontWeight: "bold"
  },
  reviewers: {
    "& h4": {
      padding: "0 25px"
    },
    "& ul": {
      display: "block",
      listStyleType: "none",
      margin: 0,
      padding: 0,
      "& li": {
        width: "100%",
        margin: "6px 0",
        padding: 0
      }
    }
  }
});

const Reviewers = observer(({ id }) => {

  const classes = useStyles();

  const { authStore, reviewsStore } = useStores();

  useEffect(() => {
    reviewsStore.getInstanceReviews(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInstanceReviews = () => reviewsStore.getInstanceReviews(id);

  const handleRemoveUserInvitation = userId => reviewsStore.removeInstanceReviewRequest(id, userId);

  const handleInviteUser = userId => reviewsStore.addInstanceReviewRequest(id, userId);

  const excludedUsers = reviewsStore.reviews.map(review => review.id);
  if (authStore.hasUserProfile && authStore.user && authStore.user.id && !excludedUsers.includes(authStore.user.id)) {
    excludedUsers.push(authStore.user.id);
  }

  if(reviewsStore.isFetching) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <FetchingLoader>
            <span>Fetching reviewers...</span>
          </FetchingLoader>
      </div>
    );
  }

  if(reviewsStore.hasFetchError) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <div>
          <FontAwesomeIcon icon="exclamation-triangle" style={{color: "var(--ft-color-error)"}}/>&nbsp;&nbsp;<small>{reviewsStore.fetchError}</small>
          &nbsp;&nbsp;<FontAwesomeIcon icon="redo-alt" style={{cursor: "pointer"}} title="retry" onClick={fetchInstanceReviews}/>
        </div>
      </div>
    );
  }

  if(reviewsStore.error) {
    return(
      <div className={classes.container}>
        <h5 className={classes.title}>Reviewers:</h5>
        <div>
          <FontAwesomeIcon icon="exclamation-triangle" style={{color: "var(--ft-color-error)"}}/>&nbsp;&nbsp;<small>{reviewsStore.error}</small>
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
            {reviewsStore.reviews.map(review => (
              <li key={review.userId}>
                <Reviewer review={review} onRemoveInvitation={handleRemoveUserInvitation} onInvite={handleInviteUser} />
              </li>
            ))}
          </ul>
        </div>
        <Search onSelect={handleInviteUser} excludedUsers={excludedUsers} />
      </div>
    </div>
  );
});
Reviewers.displayName = "Reviewers";

export default Reviewers;