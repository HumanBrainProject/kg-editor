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

import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    position: "absolute",
    top: 0,
    width: "100%",
    background: "hsla(191, 32%, 31%, 0.3)",
    color: "var(--ft-color-quiet)",
    padding: "5px 0 7px 20px",
    "& > svg": {
      transform: "translateY(3px)"
    },
    "& > h3": {
      margin: "0 10px",
      fontSize: "16px"
    },
    "& > button": {
      position: "absolute",
      right: 0,
      top: 0,
      height: "100%",
      padding: "5px 10px 5px 15px",
      textAlign: "right",
      background: "none",
      border: "0",
      cursor: "pointer",
      outline: "0",
      "&:hover": {
        color: "var(--ft-color-loud)"
      }
    }
  },
  tip: {
    flex: "1",
    "& .kbd": {
      display: "inline-block",
      margin: "0 0.1em",
      padding: "0.1em 0.6em",
      border: "1px solid #ccc",
      borderRadius: "3px",
      backgroundColor: "#f7f7f7",
      fontFamily: "Arial,Helvetica,sans-serif",
      fontSize: "11px",
      lineHeight: "1.4",
      color: "#333",
      boxShadow: "0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset",
      textShadow: "0 1px 0 #fff",
      whiteSpace: "nowrap"
    }
  },
  bookmarkIcon: {
    color: "var(--bookmark-on-color)"
  }
});

const TipsOfTheDay = observer(() => {

  const tips = [
    <span key="1">to create a new bookmark list click on the <FontAwesomeIcon icon="star" className={classes.bookmarkIcon} /> button of an instance and type the name of the new desired bookmark list.</span>,
    <span key="2">press <span className="kbd">Alt</span> + <span className="kbd">d</span> to show the dashboard.</span>,
    <span key="3">press <span className="kbd">Alt</span> + <span className="kbd">b</span> to browse the instances.</span>,
    <span key="4">press <span className="kbd">Ctrl</span> + click to open an instance in a new background tab.</span>,
    <span key="5">press <span className="kbd">Alt</span> + <span className="kbd">n</span> to create a new instance.</span>,
    <span key="6">press <span className="kbd">Alt</span> + <span className="kbd">w</span> to close current tab.</span>,
    <span key="7">press <span className="kbd">Alt</span> + <span className="kbd">Shift</span> + <span className="kbd">w</span> to close all tabs.</span>,
    <span key="8">press <span className="kbd">Alt</span> + <span className="kbd">&#8592;</span> to active previous tab.</span>,
    <span key="9">press <span className="kbd">Alt</span> + <span className="kbd">&#8594;</span> to active next tab.</span>,
    <span key="10">press <span className="kbd">Ctrl</span> + <span className="kbd">Alt</span> + <span className="kbd">t</span> to toggle theme.</span>
  ];

  const classes = useStyles();

  const [currentIndex, seCurrentIndex] = useState(Math.floor(Math.random() * 10) % tips.length);


  const handleShowNextTip = () => {
    seCurrentIndex((currentIndex + 1 === tips.length)?0:(currentIndex + 1));
  };

  if (!this.tips.length) {
    return null;
  }

  return (
    <div className={classes.container}>
      <FontAwesomeIcon icon={"lightbulb"} />
      <h3>Tips of the day:</h3>
      <div className={classes.tip}>{tips[currentIndex]}</div>
      <button onClick={handleShowNextTip} title="show next tip"><FontAwesomeIcon icon="angle-right" /></button>
    </div>
  );
});

export default TipsOfTheDay;