import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import reviewsStore from "../../../Stores/ReviewsStore";
import authStore from "../../../Stores/AuthStore";

import Reviewer from "./Reviewer";
import Search from "./Search";
import FetchingLoader from "../../../Components/FetchingLoader";
import BGMessage from "../../../Components/BGMessage";

const styles = {
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
};

@injectStyles(styles)
@observer
export default class Reviewers extends React.Component{
  componentDidMount() {
    this.fetchInstanceReviews();
  }

  get org() {
    const [org, , , , ] = this.props.id?this.props.id.split("/"):["", "", "", "", ""];
    return org;
  }

  fetchInstanceReviews = () => {
    reviewsStore.getInstanceReviews(this.props.id);
  }

  handleCancelUserInvitation = userId => {
    //window.console.log(`cancel invitation to user "${userId}" to review instance "${this.props.id}"`);
    reviewsStore.removeInstanceReviewRequest(this.props.id, userId);
  }

  handleInviteUser = userId => {
    //window.console.log(`invite user "${userId}" to review instance "${this.props.id}"`);
    reviewsStore.addInstanceReviewRequest(this.props.id, this.org, userId);
  }

  render(){
    const { classes } = this.props;

    const instanceReviews = reviewsStore.getInstanceReviews(this.props.id);

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
                <h4>{instanceReviews.reviews.length?"Users invited to review the instance:":(this.org?"Invite users to review":"")}</h4>
                <ul>
                  {instanceReviews.reviews.map(review => (
                    <li key={review.userId}>
                      <Reviewer review={review} onCancelInvitation={this.handleCancelUserInvitation} onInvite={this.handleInviteUser} />
                    </li>
                  ))}
                </ul>
              </div>
              <Search onSelect={this.handleInviteUser} excludedUsers={excludedUsers} />
            </div>
            :
            <BGMessage icon={"ban"} className={classes.error}>
              There was a network problem fetching the reviewers for instance {this.props.id}.<br/>
              If the problem persists, please contact the support.<br/>
              <small>{instanceReviews.fetchError}</small><br/><br/>
              <Button bsStyle="primary" onClick={this.fetchInstanceReviews.bind(this)}>
                <FontAwesomeIcon icon="redo-alt"/>&nbsp;&nbsp; Retry
              </Button>
            </BGMessage>
        }
      </div>
    );
  }
}