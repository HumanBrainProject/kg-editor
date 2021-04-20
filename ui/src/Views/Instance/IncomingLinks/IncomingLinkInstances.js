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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { useStores } from "../../../Hooks/UseStores";

import IncomingLinkInstance from "./IncomingLinkInstance";

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
  },
  type: {
    paddingRight: "10px"
  },
  showMore: {
    paddingLeft: 0,
    paddingTop: 0,
    transform: "translateY(1px)"
  },
  showMoreLoading: {
    display: "block"
  },
  showMoreError: {
    display: "block",
    color: "var(--ft-color-error)"
  }
});

const IncomingLinkInstances = observer(({ link, readMode }) => {

  const classes = useStyles();

  const { instanceStore } = useStores();

  const handleShowMore = () => instanceStore.fetchMoreIncomingLinks(link.instanceId, link.property, link.type.name);

  return (
    <div className={classes.container}>
      <div>
        <span className={classes.type} title={link.type.name}><FontAwesomeIcon icon={"circle"} color={link.type.color}/>&nbsp;&nbsp;<span>{link.type.label?link.type.label:link.type.name}</span></span>
      </div>
      <ul>
        {link.instances.map(instance => (
          <li key={instance.id}>
            <IncomingLinkInstance instance={instance} readMode={readMode} />
          </li>
        ))}
        {link.fetchError?
          <li className={classes.showMoreError}>
            <FontAwesomeIcon icon="exclamation-triangle" /> {link.fetchError}. <Button variant="primary" onClick={handleShowMore}>Retry</Button>
          </li>
          :
          link.isFetching?
            <li className={classes.showMoreLoading}>
              <FontAwesomeIcon icon="circle-notch" spin/> Loading more incoming links...
            </li>
            :
            link.total > (link.from + link.size) && (
              <li>
                <Button className={classes.showMore} variant="link" onClick={handleShowMore}>show more...</Button>
              </li>
            )
        }
      </ul>
    </div>
  );

});
IncomingLinkInstances.displayName = "IncomingLinkInstances";

export default IncomingLinkInstances;