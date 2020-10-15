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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import instancesStore from "../Stores/InstancesStore";

import Field from "../Fields/Field";
import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";
import Status from "./Instance/Status";
// import BookmarkStatus from "./Instance/BookmarkStatus";
import Actions from "./Preview/Actions";
import GlobalFieldErrors from "../Components/GlobalFieldErrors";

const styles = {
  container: {
    height: "100%",
    padding: "10px 0",
    "& .quickfire-field-checkbox .quickfire-label": {
      "&:after": {
        display: "none"
      },
      "& + .checkbox": {
        display: "inline-block",
        margin: "0 0 0 4px",
        verticalAlign: "middle",
        "& label input[type=checkbox]": {
          fontSize: "16px"
        }
      },
      "& + span": {
        verticalAlign: "text-bottom",
        "& input[type=checkbox]": {
          fontSize: "16px",
          marginTop: "0"
        }
      }
    },
    "&.hide-empty-fields .quickfire-empty-field": {
      display: "none"
    },
    "&.no-permission":{
      padding: "10px"
    }
  },
  content: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "100%",
    height: "100%",
    "& > .header": {
      padding: "0 10px"
    },
    "& .quickfire-form": {
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
  bookmarkStatus: {
    marginRight: "5px",
    fontSize: "1em"
  },
  type: {
    display: "inline-block",
    paddingRight: "8px",
    verticalAlign: "text-bottom",
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
  }
};

@injectStyles(styles)
@observer
class Preview extends React.Component {

  componentDidMount() {
    this.fetchInstance();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instanceId !== this.props.instanceId) {
      this.fetchInstance();
    }
  }

  fetchInstance(forceFetch=false) {
    const instance = instancesStore.createInstanceOrGet(this.props.instanceId);
    instance.fetch(forceFetch);
  }

  handleRetry = () => this.fetchInstance(true);

  render() {
    // const { classes, className, instanceId, instanceName, showEmptyFields=true, showAction=true, showBookmarkStatus=true, showTypes=false, showStatus=true, showMetaData=true } = this.props;
    const { classes, className, instanceId, instanceName, showEmptyFields=true, showAction=true, showTypes=false, showStatus=true, showMetaData=true } = this.props;

    const instance = instanceId?instancesStore.instances.get(instanceId):null;
    if (!instance) {
      return null;
    }

    if(instance.hasFetchError) {
      return(
        <div className={`${classes.container} ${showEmptyFields?"":"hide-empty-fields"}  ${className?className:""}`}>
          <BGMessage icon={"ban"}>
                There was a network problem fetching the instance &quot;<i>{instanceId}&quot;</i>.
            <br />
                If the problem persists, please contact the support.
            <br />
            <small>{instance.fetchError}</small>
            <br />
            <br />
            <Button bsStyle={"primary"} onClick={this.handleRetry}>
              <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
            </Button>
          </BGMessage>
        </div>
      );
    }

    if(!instance.isFetched || instance.isFetching) {
      return(
        <div className={`${classes.container} ${showEmptyFields?"":"hide-empty-fields"}  ${className?className:""}`}>
          <FetchingLoader>
            <span>Fetching instance &quot;<i>{instanceId}&quot;</i>information...</span>
          </FetchingLoader>
        </div>
      );
    }

    if(instance.isFetched && !instance.permissions.canRead) {
      const fieldStore = instance.fields[instance.labelField];
      return(
        <div className={`${classes.container} ${className?className:""} no-permission`} >
          <Field name={instance.labelField} fieldStore={fieldStore} readMode={true} className={classes.field} />
          <div className={classes.errorMessage}>
            <FontAwesomeIcon icon="ban" /> You do not have permission to view the instance.
          </div>
        </div>
      );
    }

    const fields = [...instance.promotedFields, ...instance.nonPromotedFields];

    return (
      <div className={`${classes.container} ${showEmptyFields?"":"hide-empty-fields"}  ${className?className:""}`}>
        <div className={classes.content}>
          <div className="header">
            {showAction && (
              <Actions instance={instance} />
            )}
            <div className={classes.titlePanel}>
              {/* {showBookmarkStatus && (
                  <BookmarkStatus className={classes.bookmarkStatus} id={instanceId} />
                )} */}
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
              <div>Workspace: {instance.workspace}</div>
            </div>
          </div>
          <Scrollbars autoHide>
            {instance.hasFieldErrors ? <div className={classes.errorReport}><GlobalFieldErrors instance={instance} /> </div>:
              <div>
                {fields.map(name => {
                  const fieldStore = instance.fields[name];
                  return (
                    <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} readMode={true} />
                  );
                })}
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
              </div>}
          </Scrollbars>
        </div>
      </div>
    );
  }
}

export default Preview;