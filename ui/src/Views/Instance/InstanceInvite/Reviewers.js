/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/


import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../../Hooks/UseStores";

import Reviewer from "./Reviewer";
import Search from "./Search";
import FetchingLoader from "../../../Components/FetchingLoader";
import BGMessage from "../../../Components/BGMessage";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    color: "var(--ft-color-normal)",
    "& .errorPanel, & .fetchingPanel": {
      color: "var(--ft-color-loud)",
      "& svg path": {
        stroke: "var(--ft-color-loud)",
        fill: "var(--ft-color-quiet)"
      }
    }
  },
  panel: {
    position: "relative",
    width: "100%",
    padding: "15px 3px 15px 13px",
    border: "1px solid var(--bg-color-blend-contrast1)",
    backgroundColor: "var(--bg-color-ui-contrast2)"
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

  const [org] = id?id.split("/"):[""];

  useEffect(() => {
    reviewsStore.getInstanceReviews(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // check if id is needed

  const fetchInstanceReviews = () => {
    reviewsStore.getInstanceReviews(id);
  };

  const handleCancelUserInvitation = userId => {
    //window.console.log(`cancel invitation to user "${userId}" to review instance "${id}"`);
    reviewsStore.removeInstanceReviewRequest(id, userId);
  };

  const handleInviteUser = userId => {
    //window.console.log(`invite user "${userId}" to review instance "${id}"`);
    reviewsStore.addInstanceReviewRequest(id, org, userId);
  };

  const instanceReviews = reviewsStore.getInstanceReviews(id);

  const excludedUsers = instanceReviews.reviews.map(review => review.userId);
  if (authStore.hasUserProfile && authStore.user && authStore.user.id && !excludedUsers.includes(authStore.user.id)) {
    excludedUsers.push(authStore.user.id);
  }

  return (
    <div className={classes.container}>
      {instanceReviews.isFetching?
        <FetchingLoader>
          <span>Fetching reviewers...</span>
        </FetchingLoader>
        :!instanceReviews.hasFetchError?
          <div className={classes.panel}>
            <div className={classes.reviewers} >
              <h4>{instanceReviews.reviews.length?"Users invited to review the instance:":(org?"Invite users to review":"")}</h4>
              <ul>
                {instanceReviews.reviews.map(review => (
                  <li key={review.userId}>
                    <Reviewer review={review} onCancelInvitation={handleCancelUserInvitation} onInvite={handleInviteUser} />
                  </li>
                ))}
              </ul>
            </div>
            <Search onSelect={handleInviteUser} excludedUsers={excludedUsers} />
          </div>
          :
          <BGMessage icon={"ban"} className={classes.error}>
              There was a network problem fetching the reviewers for instance &quot;<i>{id}&quot;</i>.<br/>
              If the problem persists, please contact the support.<br/>
            <small>{instanceReviews.fetchError}</small><br/><br/>
            <Button variant="primary" onClick={fetchInstanceReviews}>
              <FontAwesomeIcon icon="redo-alt"/>&nbsp;&nbsp; Retry
            </Button>
          </BGMessage>
      }
    </div>
  );
});
Reviewers.displayName = "Reviewers";

export default Reviewers;