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
import { createUseStyles } from "react-jss";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import InfiniteScroll from "react-infinite-scroller";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import { Scrollbars } from "react-custom-scrollbars-2";
import ReactPiwik from "react-piwik";

import { useStores } from "../../Hooks/UseStores";

import Spinner from "../../Components/Spinner";
import BGMessage from "../../Components/BGMessage";
import Filter from "../../Components/Filter";
import Preview from "../Preview";
import InstanceRow from "../Instance/InstanceRow";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  container:{
    color: "var(--ft-color-loud)",
    overflow:"hidden",
    position:"relative",
    display:"grid",
    gridTemplateColumns:"1fr 33%",
    gridTemplateRows:"auto 1fr"
  },
  preview:{
    position:"relative",
    gridRow:"1 / span 2",
    gridColumn:"2",
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-loud)"
  },
  loader:{
    textAlign:"center",
    margin:"20px 0 30px",
    fontSize:"1.25em",
    fontWeight:"300"
  },
  list:{
    "& ul": {
      listStyleType: "none",
      padding:"1px 11px 1px 11px"
    }
  },
  header:{
    display:"grid",
    gridTemplateColumns:"1fr auto",
    gridGap:"10px",
    padding:"5px 10px 0 0",
    position:"relative"
  },
  instanceCount:{
    color: "var(--ft-color-normal)",
    lineHeight:"34px",
    background:"var(--bg-color-ui-contrast2)",
    padding:"0 10px",
    margin: "10px 0 10px -10px"
  }
});

const Instances = observer(() => {

  const classes = useStyles();

  const { appStore, browseStore, instanceStore } = useStores();
  const navigate = useNavigate();

  const handleFilterChange = value => {
    ReactPiwik.push(["trackEvent", "Browse", "FilterInstance", value]);
    browseStore.setInstancesFilter(value);
  };

  const handleInstanceClick = instance => {
    ReactPiwik.push(["trackEvent", "Browse", "InstancePreview", instance.id]);
    browseStore.selectInstance(instance);
  }

  const handleInstanceCtrlClick = instance => {
    if (instance && instance.id) {
      ReactPiwik.push(["trackEvent", "Browse", "InstanceOpenTabInBackground", instance.id]);
      appStore.openInstance(instance.id, instance.name, instance.primaryType);
    }
  };

  const handleInstanceActionClick = (summaryInstance, mode) => {
    const id = summaryInstance && summaryInstance.id;
    if (id) {
      if (!instanceStore.instances.has(id)) {
        const instance = instanceStore.createInstanceOrGet(id);
        instance.initializeLabelData(toJS(summaryInstance));
      }
      ReactPiwik.push(["trackEvent", "Browse", `InstanceOpenTabIn${mode[0].toUpperCase() + mode.substr(1)}Mode`, id]);
      if(mode === "view") {
        navigate(`/instances/${id}`);
      } else {
        navigate(`/instances/${id}/${mode}`);
      }
    }
  };

  const handleLoadMore = () => browseStore.fetchInstances(true);

  const handleRetry = () => browseStore.fetchInstances();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {browseStore.selectedItem !== null && (
          <>
            <Filter value={browseStore.instancesFilter} placeholder={`Filter instances of ${browseStore.selectedItem.label}`} onChange={handleFilterChange} />
            <div className={classes.instanceCount}>
              {browseStore.totalInstances} Result{`${browseStore.totalInstances !== 0?"s":""}`}
            </div>
          </>
        )}
      </div>
      <Scrollbars autoHide>
        {browseStore.selectedItem ?
          !browseStore.fetchError.instances ?
            !browseStore.isFetching.instances ?
              browseStore.instances.length ?
                <InfiniteScroll
                  threshold={400}
                  pageStart={0}
                  loadMore={handleLoadMore}
                  hasMore={browseStore.canLoadMoreInstances}
                  loader={<div className={classes.loader} key={0}><FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;<span>Loading more instances...</span></div>}
                  useWindow={false}>
                  <div className={classes.list}>
                    <ul>
                      {browseStore.instances.map(instance => (
                        <li key={instance.id}><InstanceRow instance={instance} selected={instance === browseStore.selectedInstance} onClick={handleInstanceClick}  onCtrlClick={handleInstanceCtrlClick}  onActionClick={handleInstanceActionClick} /></li>
                      ))}
                    </ul>
                  </div>
                </InfiniteScroll>
                :
                <BGMessage icon={"unlink"}>
                    No instances could be found in this list
                  {browseStore.instancesFilter && <div>with the search term {`"${browseStore.instancesFilter}"`}</div>}
                </BGMessage>
              :
              <Spinner>
                <span>Fetching instances...</span>
              </Spinner>
            :
            <BGMessage icon={"ban"}>
                There was a network problem retrieving the list of instances.<br/>
                If the problem persists, please contact the support.<br/><br/>
              <Button variant={"primary"} onClick={handleRetry}>
                <FontAwesomeIcon icon={"redo-alt"}/> &nbsp; Retry
              </Button>
            </BGMessage>
          :
          <BGMessage icon={"code-branch"} transform={"flip-h rotate--90"}>
              Select a list of instances in the left panel
          </BGMessage>
        }
      </Scrollbars>
      <div className={classes.preview}>
        {browseStore.selectedInstance?
          <Preview instanceId={browseStore.selectedInstance.id} instanceName={browseStore.selectedInstance.name}/>
          :
          <BGMessage icon={"money-check"}>
              Select an instance to display its preview here.
          </BGMessage>
        }
      </div>
    </div>
  );
});
Instances.displayName = "Instances";

export default Instances;