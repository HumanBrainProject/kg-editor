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

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";

import { useStores } from "../../Hooks/UseStores";

import GraphViz from "./InstanceGraph/GraphViz";
import GraphSettings from "./InstanceGraph/GraphSettings";
import Spinner from "../../Components/Spinner";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "grid",
    gridGap: "10px",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "1fr 450px",
    padding: "10px",
    color: "var(--ft-color-normal)"
  },
  graph: {
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow: "hidden",
    position: "relative",
  },
  settings: {
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow: "auto",
    position: "relative"
  },
  loader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    background: "var(--bg-color-blend-contrast1)",
    "& .spinnerPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  fetchErrorPanel: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    padding: "30px",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRadius: "4px",
    color: "var(--ft-color-loud)",
    background: "var(--list-bg-hover)",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "var(--ft-color-error)"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  }
});

const GraphInstance = observer(({ instance }) => {

  const classes = useStyles();

  const { graphStore } = useStores();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetch(), [instance]);

  const fetch = () => graphStore.fetch(instance.id);

  if (graphStore.fetchError) {
    return (
      <div className={classes.fetchErrorPanel}>
        <h4>Error while fetching graph data for instance &quot;{instance.id}&quot; ({graphStore.fetchError})</h4>
        <Button variant="primary" onClick={fetch}>Retry</Button>
      </div>
    );
  }

  if (graphStore.isFetching) {

    return (
      <div className={classes.loader}>
        <Spinner>Fetching visualization data for instance &quot;{instance.id}&quot; ...</Spinner>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.graph}>
        <GraphViz />
      </div>
      <div className={classes.settings}>
        <GraphSettings />
      </div>
    </div>
  );
});
GraphInstance.displayName = "GraphInstance";

export default GraphInstance;