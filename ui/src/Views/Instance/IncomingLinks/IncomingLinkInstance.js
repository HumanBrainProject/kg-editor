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
import Badge from "react-bootstrap/Badge";

import { useStores } from "../../../Hooks/UseStores";



const useStyles = createUseStyles({
  pill: {
    cursor: "pointer"
  }
});


const IncomingLinkInstance = observer(({instance, space, readMode }) => {

  const classes = useStyles();

  const { appStore, history } = useStores();

  if (readMode) {
    return (
      <span>
        <Badge pill variant="secondary" >
          {instance.label}
        </Badge>
      </span>
    );
  }

  const handleOpenInstance = () => {
    if(appStore.currentWorkspace.id !== space) {
      appStore.setCurrentWorkspace(space);
    }
    history.push(`/instances/${instance.id}`);
  };

  return (
    <span className={classes.pill} title={space}>
      <Badge pill variant="secondary" onClick={handleOpenInstance} >
        {instance.label}
      </Badge>
    </span>
  );

});
IncomingLinkInstance.displayName = "IncomingLinkInstance";

export default IncomingLinkInstance;