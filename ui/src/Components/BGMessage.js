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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  container:{
    position:"absolute !important",
    top:"50%",
    left:"50%",
    transform:"translate(-50%,-200px)",
    textAlign:"center"
  },
  icon:{
    fontSize:"10em",
    "& path":{
      fill:"var(--bg-color-blend-contrast1)",
      stroke:"rgba(200,200,200,.1)",
      strokeWidth:"3px"
    }
  },
  text:{
    fontWeight:"300",
    fontSize:"1.2em"
  }
});

const BGMessage = ({ icon, transform, children }) => {
  const classes = useStyles();
  return(
    <div className={classes.container}>
      <div className={classes.icon}>
        <FontAwesomeIcon icon={icon} transform={transform}/>
      </div>
      <div className={classes.text}>
        {children}
      </div>
    </div>
  );
};

export default BGMessage;