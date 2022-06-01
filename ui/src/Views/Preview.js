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
import Form from "react-bootstrap/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import { Scrollbars } from "react-custom-scrollbars-2";

import { useStores } from "../Hooks/UseStores";

import Field from "../Fields/Field";
import BGMessage from "../Components/BGMessage";
import Status from "./Instance/Status";
import Actions from "./Preview/Actions";
import GlobalFieldErrors from "../Components/GlobalFieldErrors";
import IncomingLinks from "./Instance/IncomingLinks/IncomingLinks";
import Spinner from "../Components/Spinner";

const useStyles = createUseStyles({
  container: {
    height: "100%",
    padding: "10px 0"
  },
  noPermission: {
    padding: "10px"
  },
  content: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "100%",
    height: "100%",
    "& > .header": {
      padding: "0 10px"
    },
    "& .popover-popup": {
      display: "none !important"
    },
    "&:hover .popover-popup": {
      display: "block !important"
    }
  },
  status: {
    position: "absolute",
    top: "6px",
    right: "-54px",
    fontSize: "25px"
  },
  type: {
    display: "inline-block",
    paddingRight: "8px",
    verticalAlign: "text-bottom"
  },
  titlePanel: {
    position: "relative",
    width: "calc(100% - 70px)"
  },
  title: {
    fontSize: "1.5em",
    fontWeight: "300"
  },
  metadataTitle: {
    display: "inline-block",
    marginBottom: "10px"
  },
  info: {
    fontSize: "0.75em",
    color: "var(--ft-color-normal)",
    marginTop: "20px",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "10px",
    wordBreak: "break-word"
  },
  duplicate: {
    extend: "action"
  },
  errorReport: {
    margin: "10px"
  },
  errorMessage: {
    marginBottom: "15px",
    fontWeight:"300",
    fontSize:"1em",
    color: "var(--ft-color-error)",
    "& path":{
      fill:"var(--ft-color-error)",
      stroke:"rgba(200,200,200,.1)",
      strokeWidth:"3px"
    }
  },
  form: {
    padding: "0 10px"
  }
});

const Preview  = observer(({ instanceId, instanceName, showEmptyFields=true, showAction=true, showTypes=false, showStatus=true, showMetaData=true}) => {

  const classes = useStyles();

  const { instanceStore } = useStores();

  useEffect(() => {
    fetchInstance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const fetchInstance = (forceFetch=false) =>  {
    const inst = instanceStore.createInstanceOrGet(instanceId);
    inst.fetch(forceFetch);
  };

  const handleRetry = () => fetchInstance(true);

  const instance = instanceStore.instances.get(instanceId);
  if (!instance) {
    return null;
  }

  if(instance.hasFetchError) {
    return(
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
                There was a network problem retrieving the instance &quot;<i>{instanceId}&quot;</i>.
          <br />
                If the problem persists, please contact the support.
          <br />
          <small>{instance.fetchError}</small>
          <br />
          <br />
          <Button variant={"primary"} onClick={handleRetry}>
            <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
          </Button>
        </BGMessage>
      </div>
    );
  }

  if(!instance.isFetched || instance.isFetching) {
    return(
      <div className={classes.container}>
        <Spinner text={`Retrieving instance ${instanceId}...`} />
      </div>
    );
  }

  if(instance.isFetched && !instance.permissions.canRead) {
    if (instance.labelField) {
      const fieldStore = instance.fields[instance.labelField];
      return (
        <Form className={`${classes.container} ${classes.noPermission}`} >
          <Field name={instance.labelField} fieldStore={fieldStore} readMode={true} className={classes.field} />
          <div className={classes.errorMessage}>
            <FontAwesomeIcon icon="ban" /> You do not have permission to view the instance.
          </div>
        </Form>
      );
    } else {
      return (
        <Form className={`${classes.container} ${classes.noPermission}`} >
          <div className={classes.info}>
            <div>ID: {instanceId}</div>
            <div>Space: {instance.space}</div>
          </div>
          <div className={classes.errorMessage}>
            <FontAwesomeIcon icon="ban" /> You do not have permission to view the instance.
          </div>
        </Form>
      );
    }
  }

  return (
    <div className={`${classes.container} ${showEmptyFields?"":"hide-empty-fields"}`}>
      <div className={classes.content}>
        <div className="header">
          {showAction && (
            <Actions instance={instance} />
          )}
          <div className={classes.titlePanel}>
            {showTypes && (
              <div className={classes.type} style={instance.primaryType.color ? { color: instance.primaryType.color } : {}} title={instance.primaryType.name}>
                <FontAwesomeIcon fixedWidth icon="circle" />
              </div>
            )}
            <span className={classes.title}>
              {instanceName?instanceName:instance.name}
            </span>
            {showStatus && (
              <div className={`${classes.status}`}>
                <Status
                  darkmode={true}
                  id={instanceId}
                />
              </div>
            )}
          </div>
          <div className={classes.info}>
            <div>ID: {instanceId}</div>
            <div>Space: {instance.space}</div>
          </div>
        </div>
        <Scrollbars autoHide>
          {instance.hasFieldErrors ?
            <div className={classes.errorReport}>
              <GlobalFieldErrors instance={instance} />
            </div>:
            <Form className={`${classes.form}`}>
              {instance.sortedFieldNames.map(name => {
                const fieldStore = instance.fields[name];
                return (
                  <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} readMode={true} showIfNoValue={showEmptyFields} />
                );
              })}
              <IncomingLinks links={instance.incomingLinks} readMode={true} />
              {showMetaData && instance.metadata && instance.metadata.length > 0 && (
                <div>
                  <hr />
                  <span className={`${classes.title} ${classes.metadataTitle}`}>
                    {" "}
                      Metadata{" "}
                  </span>
                  {instance.metadata.map(field => (
                    <div key={instanceId + field.label} className={classes.field}>
                      <label>{field.label}: </label> {field.value}
                    </div>
                  ))}
                </div>
              )}
            </Form>}
        </Scrollbars>
      </div>
    </div>
  );
});
Preview.displayName = "Preview";

export default Preview;