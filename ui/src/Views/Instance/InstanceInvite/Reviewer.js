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

import React from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import User from "../../User";

const useStyles = createUseStyles({
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
});

const Reviewer = observer(({ review, onCancelInvitation }) => {

  const classes = useStyles();

  const handleCancelInvitation = () => {
    typeof onCancelInvitation === "function" && onCancelInvitation(review.userId);
  };

  if (!review) {
    return null;
  }

  return (
    <div className={classes.container}>
      <User key={review.userId}  userId={review.userId} />
      <button title="cancel invitation" onClick={handleCancelInvitation}><FontAwesomeIcon icon="times"/></button>
    </div>
  );
});

export default Reviewer;