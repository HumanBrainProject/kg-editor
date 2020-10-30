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
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";

const useStyles = createUseStyles({
  fetchingPanel: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.2em",
    fontWeight: "lighter",
    width:"100%",
    textAlign:"center"
  },
  fetchingLabel: {
    paddingLeft: "6px",
    display:"inline-block"
  }
});

const FetchingLoader = ({children}) => {
  const classes = useStyles();
  return (
    <div className={`${classes.fetchingPanel} fetchingPanel`}>
      <FontAwesomeIcon icon="circle-notch" spin/>
      <span className={`${classes.fetchingLabel} fetchingLabel`}>
        {children}
      </span>
    </div>
  );
};

export default FetchingLoader;