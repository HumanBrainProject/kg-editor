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

import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import User from "../../User";

const styles = {
  container: {
    position: "relative",
    display: "grid",
    overflow: "hidden",
    gridTemplateColumns: "1fr 30px",
    gridTemplateRows: "auto",
    alignItems: "center",
    width: "100%",
    margin: "6px 0",
    padding: 0,
    "& .review-status": {
      opacity: "0.6"
    },
    "& .user": {
      display: "flex",
      alignItems: "center",
      margin: "0 3px 0 6px",
      padding: "6px",
      background: "var(--bg-color-ui-contrast3)",
      "& .avatar": {
        margin: "0 5px",
        "&.default": {
          margin: "0 8px 0 10px"
        }
      }
    },
    "& button": {
      color: "transparent",
      margin: 0,
      border: 0,
      background: "none",
      "&:hover, &:active, &:focus": {
        color: "var(--ft-color-louder)"
      }
    },
    "&:hover": {
      color: "var(--ft-color-louder)",
      "& .review-status": {
        opacity: "1"
      },
      "& .user .name:not(.is-curator)": {
        color: "#84b3dc"
      },
      "& button": {
        color: "var(--ft-color-normal)",
        "&:hover, &:active, &:focus": {
          color: "var(--ft-color-louder)"
        }
      }
    }
  },
  reviewStatus: {
    padding: "6px 0",
    verticalAlign: "middle"
  }
};

@injectStyles(styles)
@observer
export default class Reviewer extends React.Component{

  handleInvite = userName => {
    const { onInvite } = this.props;
    typeof onInvite === "function" && onInvite(userName);
  }

  handleCancelInvitation = userName => {
    const { onCancelInvitation } = this.props;
    typeof onCancelInvitation === "function" && onCancelInvitation(userName);
  }

  render() {
    const { classes, review } = this.props;

    if (!review) {
      return null;
    }

    return (
      <div className={classes.container}>
        <User key={review.username}  userId={review.username} />
        <button title="cancel invitation" onClick={this.handleCancelInvitation.bind(this, review.username)}><FontAwesomeIcon icon="times"/></button>
      </div>
    );
  }
}