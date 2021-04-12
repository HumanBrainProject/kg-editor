/*
*   Copyright (c) 2021, EPFL/Human Brain Project PCO
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
//import Badge from "react-bootstrap/Badge";
import Label from "../../../Fields/Label";
import PossibleIncomingLink from "./PossibleIncomingLink";

const useStyles = createUseStyles({
  container: {
    "& > ul": {
      listStyle: "none",
      paddingLeft: "20px",
      "& > li": {
        display: "inline",
        "& + li:before": {
          content: "' '"
        }
      }
    }
  }
});

const PossibleIncomingLinks = observer(({ links, type }) => {

  const classes = useStyles();

  if(!links || !links.length) {
    return null;
  }

  return(
    <div className={classes.container}>
      <Label label={`${type} can be linked from`}/>
      <ul>
        {links.map((l, index) => (
          <li key={index}>
            <PossibleIncomingLink type={l.type} spaces={l.spaces} />
          </li>
        ))}
      </ul>
    </div>
  );
});
PossibleIncomingLinks.displayName = "PossibleIncomingLinks";

export default PossibleIncomingLinks;