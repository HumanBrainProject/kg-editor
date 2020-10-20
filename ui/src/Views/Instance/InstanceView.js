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
import {observer} from "mobx-react";
import { createUseStyles } from "react-jss";

import viewStore, { ViewContext} from "../../Stores/ViewStore";

import InstanceForm from "./InstanceForm";
import Pane from "./Pane";
import Links from "./Links";

const useStyles = createUseStyles({
  container: {
    height: "100%",
    width: "100%",
    display: "grid",
    position:"relative",
    overflow: "hidden",
    "--selected-index":"0"
  }
});

const InstanceView = observer(({ instance }) => {

  if (!viewStore.selectedView ||  viewStore.selectedView.instanceId !== instance.id) {
    return null;
  }

  const classes = useStyles();

  return (
    <ViewContext.Provider value={viewStore.selectedView} >
      <div className={classes.container} style={{ "--selected-index": viewStore.selectedView.selectedPaneIndex }}>
        <Pane paneId={instance.id} >
          <InstanceForm view={viewStore.selectedView} pane={instance.id} id={instance.id} />
        </Pane>
        <Links instanceId={instance.id} />
      </div>
    </ViewContext.Provider>
  );
});

export default InstanceView;