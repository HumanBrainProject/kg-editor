import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import {Button, Modal} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Scrollbars } from "react-custom-scrollbars";
import Color from "color";
const jsdiff = require("diff");

import queryBuilderStore from "../../Stores/QueryBuilderStore";
import FetchingLoader from "../../Components/FetchingLoader";
import User from "../User";
import Field from "./Field";

const styles = {
  container:{
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "1fr",
    gridGap: "10px",
    height: "100%"
  },
  info: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gridColumnGap: "30px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    padding: "10px",
    "&:not(.available)": {
      display: "none",
      "& + $schemas": {
        gridRowStart: "span 2"
      }
    },
    "& h4": {
      marginTop: 0,
      marginBottom: "8px"
    }
  },
  description: {
    gridColumnStart: "span 2",
    marginTop: "20px",
    "& textarea": {
      minWidth: "100%",
      maxWidth: "100%",
      minHeight: "10rem"
    },
    "& + $save": {
      marginTop: "20px"
    }
  },
  input:{
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    width:"100%",
    border:"1px solid transparent",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    },
    "&.disabled,&:disabled":{
      backgroundColor: "var(--bg-color-blend-contrast1)",
      color: "var(--ft-color-normal)",
      cursor: "text"
    }
  },
  queryIdError: {
    gridColumnStart: "span 2",
    marginTop: "6px",
    color: "var(--ft-color-error)"
  },
  author: {
    gridColumnStart: "span 2",
    marginTop: "6px",
    color: "var(--ft-color-normal)",
    "& + $save": {
      marginTop: "20px"
    }
  },
  links: {
    gridColumnStart: "span 2",
    marginTop: "10px",
    color: "var(--ft-color-normal)",
    "& a, & a:visited, &a:active": {
      color: "var(--ft-color-loud)",
      "&:hover": {
        color: "var(--ft-color-louder)",
      }
    },
    "& + $save": {
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px solid var(--ft-color-quiet)"
    }
  },
  save: {
    gridColumnStart: "span 2",
    display: "flex",
    "& span": {
      flex: 1,
      paddingTop: "6px",
      color: "var(--ft-color-normal)"
    },
    "& button": {
      marginLeft: "10px"
    }
  },
  schemas:{
    position:"relative",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-normal)"
  },
  savingLoader:{
    position:"fixed",
    top:0,
    left:0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    background: "var(--bg-color-blend-contrast1)",
    "& .fetchingPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  saveErrorPanel: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "var(--bg-color-blend-contrast1)",
    zIndex: "1200",
    "& > div": {
      position: "absolute",
      top: "50%",
      left: "50%",
      minWidth: "220px",
      transform: "translate(-50%, -50%)",
      padding: "20px",
      borderRadius: "5px",
      background: "white",
      textAlign: "center",
      boxShadow: "2px 2px 4px #7f7a7a",
      "& h4": {
        margin: "0",
        paddingBottom: "20px",
        color: "red"
      },
      "& button + button, & a + button, & a + a": {
        marginLeft: "20px"
      }
    }
  },
  compareModal:{
    width:"90%",
    "@media screen and (min-width:1024px)": {
      width:"900px",
    },
    "& .modal-body": {
      height: "calc(95vh - 112px)",
      padding: "3px 0"
    }
  },
  comparison:{
    height: "100%",
    padding: "20px",
    "& pre": {
      border: 0,
      margin: 0,
      padding: 0,
      display: "inline",
      background: "transparent",
      wordBreak: "break-word",
      overflowWrap: "anywhere",
      "& span": {
        whiteSpace: "pre-wrap"
      }
    }
  },
  removed:{
    background:new Color("#e74c3c").lighten(0.6).hex(),
    textDecoration: "line-through",
    "& + $added": {
      marginLeft: "3px"
    }
  },
  added:{
    background:new Color("#2ecc71").lighten(0.6).hex(),
    "& + $removed": {
      marginLeft: "3px"
    }
  },
  unchanged: {

  },
  tip: {
    padding: "10px",
    borderRadius: "4px",
    background:"var(--bg-color-ui-contrast4)",
    color: "var(--ft-color-normal)"
  },
  newQueryButton: {
    position:"absolute",
    right:"12px",
    top:"9px"
  }
};

@injectStyles(styles)
@observer
export default class Query extends React.Component{

  handleChangeQueryId = event => {
    queryBuilderStore.queryId = event.target.value;
  }

  handleChangeLabel = event => {
    queryBuilderStore.label = event.target.value;
  }

  handleChangeDescription = event => {
    queryBuilderStore.description = event.target.value;
  }

  handleSave = () => {
    queryBuilderStore.saveQuery();
  }

  handleCancelSave = () => {
    queryBuilderStore.cancelSaveQuery();
  }

  handleRevertChanges = () => {
    queryBuilderStore.cancelChanges();
  }

  handleShowSaveDialog = () => {
    queryBuilderStore.saveAsMode = true;
  }

  handleHideSaveDialog = () => {
    queryBuilderStore.saveAsMode = false;
  }

  handleToggleCompareChanges = () => {
    queryBuilderStore.compareChanges = !queryBuilderStore.compareChanges;
  };

  handleResetQuery = () => {
    queryBuilderStore.resetRootSchema();
  };

  handleNewQuery = () => {
    queryBuilderStore.setAsNewQuery();
  };

  render(){
    const { classes } = this.props;

    if (!queryBuilderStore.rootField) {
      return null;
    }

    const diff = jsdiff.diffJson(queryBuilderStore.JSONSourceQuery, queryBuilderStore.JSONQuery);

    return (
      <div className={classes.container}>
        <div className={`${classes.info} ${queryBuilderStore.isQuerySaved || !queryBuilderStore.isQueryEmpty?"available":""}`}>
          {(queryBuilderStore.isQuerySaved || queryBuilderStore.saveAsMode) && (
            <React.Fragment>
              <div>
                <h4>Query :</h4>
                <input
                  className={`form-control ${classes.input}`}
                  required="required"
                  pattern={queryBuilderStore.queryIdPattern}
                  disabled={!queryBuilderStore.saveAsMode}
                  placeholder={""}
                  type="text"
                  value={(queryBuilderStore.isQuerySaved && !queryBuilderStore.saveAsMode)?queryBuilderStore.sourceQuery.id:queryBuilderStore.queryId}
                  onChange={this.handleChangeQueryId} />
              </div>
              <div>
                <h4>Label :</h4>
                <input
                  className={`form-control ${classes.input}`}
                  disabled={!(queryBuilderStore.saveAsMode || queryBuilderStore.isOneOfMySavedQueries)}
                  placeholder={""}
                  type="text"
                  value={queryBuilderStore.label}
                  onChange={this.handleChangeLabel} />
              </div>
              {queryBuilderStore.saveAsMode && !queryBuilderStore.isQueryIdValid && queryBuilderStore.queryId !== "" && (
                <div className={classes.queryIdError}>
                  <FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;&quot;{queryBuilderStore.queryId}&quot; is not a valid query name. It should not be empty. Accepted characters are a to z small or capital letters, numbers, minus and underscore!
                </div>
              )}
              {queryBuilderStore.saveAsMode && queryBuilderStore.isQueryIdValid && queryBuilderStore.queryIdAlreadyInUse && (
                <div className={classes.queryIdError}>
                  <FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;A query named &quot;{queryBuilderStore.queryId}&quot; already exists. Please choose another name!
                </div>
              )}
              {queryBuilderStore.saveAsMode && queryBuilderStore.isQueryIdValid && queryBuilderStore.queryIdAlreadyExists && (
                <div className={classes.queryIdError}>
                  <FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;You already created a query named &quot;{queryBuilderStore.queryId}&quot;. Please choose another name!
                </div>
              )}
              <div className={classes.description}>
                <h4>Description :</h4>
                <textarea
                  className={`form-control ${classes.input}`}
                  disabled={!(queryBuilderStore.saveAsMode || queryBuilderStore.isOneOfMySavedQueries)}
                  placeholder={""}
                  type="text"
                  value={queryBuilderStore.description}
                  onChange={this.handleChangeDescription} />
              </div>
              {queryBuilderStore.isQuerySaved && !queryBuilderStore.saveAsMode && !queryBuilderStore.isOneOfMySavedQueries && queryBuilderStore.sourceQuery.org && queryBuilderStore.sourceQuery.user && (
                <div className={classes.author} >
                  <span>by user<User org={queryBuilderStore.sourceQuery.org} userId={queryBuilderStore.sourceQuery.user} /></span>
                </div>
              )}
            </React.Fragment>
          )}
          {queryBuilderStore.isQuerySaved && !queryBuilderStore.saveAsMode && (
            <div className={classes.links}>
              <h6>To go further: </h6>
              <ul>
                <li>
                  <a href="/apidoc/index.html?url=/apispec/spring%3Fgroup%3D0_public%0A#/query-api/executeStoredQueryUsingGET_2" rel="noopener noreferrer" target="_blank">Service API documentation</a> to query {queryBuilderStore.rootSchema.id}/{queryBuilderStore.sourceQuery.id}
                </li>
                <li>
                  Get <a href={`/query/${queryBuilderStore.rootSchema.id}/${queryBuilderStore.sourceQuery.id}/python`} rel="noopener noreferrer" target="_blank">python code</a> for this stored query
                </li>
                <li>
                  Get <a href={`/query/${queryBuilderStore.rootSchema.id}/${queryBuilderStore.sourceQuery.id}/python/pip`}rel="noopener noreferrer" target="_blank">PyPi compatible python code</a> for this stored query
                </li>
              </ul>
            </div>
          )}
          {queryBuilderStore.isQuerySaved?
            queryBuilderStore.isOneOfMySavedQueries?
              queryBuilderStore.saveAsMode?
                <div className={classes.save}>
                  <span></span>
                  <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} onClick={this.handleHideSaveDialog}>Cancel</Button>
                  <Button bsStyle="primary" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || queryBuilderStore.isQueryEmpty || !queryBuilderStore.isQueryIdValid || queryBuilderStore.queryIdAlreadyInUse || queryBuilderStore.queryIdAlreadyExists} onClick={this.handleSave}><FontAwesomeIcon icon="save"/>&nbsp;Save</Button>
                </div>
                :
                <div className={classes.save}>
                  <span></span>
                  {queryBuilderStore.hasChanged && (
                    <Button disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || !queryBuilderStore.hasQueryChanged}  onClick={this.handleToggleCompareChanges}><FontAwesomeIcon icon="glasses"/>&nbsp;Compare</Button>
                  )}
                  {queryBuilderStore.hasChanged && !queryBuilderStore.savedQueryHasInconsistencies &&  (
                    <Button bsStyle="default" onClick={this.handleRevertChanges}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Undo changes</Button>
                  )}
                  <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || queryBuilderStore.isQueryEmpty} onClick={this.handleShowSaveDialog}><FontAwesomeIcon icon="save"/>&nbsp;Save As</Button>
                  <Button bsStyle="primary" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || !queryBuilderStore.hasChanged || queryBuilderStore.isQueryEmpty || !queryBuilderStore.isQueryIdValid || queryBuilderStore.queryIdAlreadyInUse || (queryBuilderStore.sourceQuery && queryBuilderStore.sourceQuery.isDeleting)} onClick={this.handleSave}><FontAwesomeIcon icon="save"/>&nbsp;Save</Button>
                </div>
              :
              queryBuilderStore.saveAsMode?
                <div className={classes.save}>
                  <span></span>
                  <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} onClick={this.handleHideSaveDialog}>Cancel</Button>
                  <Button bsStyle="primary" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || queryBuilderStore.isQueryEmpty || !queryBuilderStore.isQueryIdValid || queryBuilderStore.queryIdAlreadyInUse || queryBuilderStore.queryIdAlreadyExists} onClick={this.handleSave}><FontAwesomeIcon icon="save"/>&nbsp;Save</Button>
                </div>
                :
                <div className={classes.save}>
                  <span></span>
                  {queryBuilderStore.hasChanged && (
                    <Button disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || !queryBuilderStore.hasQueryChanged}  onClick={this.handleToggleCompareChanges}><FontAwesomeIcon icon="glasses"/>&nbsp;Compare</Button>
                  )}
                  {queryBuilderStore.hasChanged && !queryBuilderStore.savedQueryHasInconsistencies && (
                    <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} onClick={this.handleRevertChanges}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Undo changes</Button>
                  )}
                  <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || queryBuilderStore.isQueryEmpty} onClick={this.handleShowSaveDialog}><FontAwesomeIcon icon="save"/>&nbsp;Save As</Button>
                </div>
            :
            queryBuilderStore.saveAsMode?
              <div className={classes.save}>
                <span></span>
                <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} onClick={this.handleHideSaveDialog}>Cancel</Button>
                <Button bsStyle="primary" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || !queryBuilderStore.hasChanged || queryBuilderStore.isQueryEmpty || !queryBuilderStore.isQueryIdValid || queryBuilderStore.queryIdAlreadyInUse} onClick={this.handleSave}><FontAwesomeIcon icon="save"/>&nbsp;Save</Button>
              </div>
              :
              <div className={classes.save}>
                <span><span className={classes.tip}><FontAwesomeIcon icon={"lightbulb"} />&nbsp;&nbsp;Click on &quot;Save As&quot; to save your query.</span></span>
                <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} onClick={this.handleResetQuery}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Reset</Button>
                <Button bsStyle="default" disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError || !queryBuilderStore.hasChanged} onClick={this.handleShowSaveDialog}><FontAwesomeIcon icon="save"/>&nbsp;Save As</Button>
              </div>
          }
          {queryBuilderStore.isQuerySaved && !queryBuilderStore.saveAsMode && (
            <div className={classes.newQueryButton}>
              <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleNewQuery} disabled={queryBuilderStore.isSaving || !!queryBuilderStore.saveError} title="Detach as a new query">
                <FontAwesomeIcon icon="times"/>
              </Button>
            </div>
          )}
        </div>
        <div className={classes.schemas}>
          <Scrollbars autoHide>
            <Field field={queryBuilderStore.rootField} />
          </Scrollbars>
        </div>
        {queryBuilderStore.isSaving && (
          <div className={classes.savingLoader}>
            <FetchingLoader>{`Saving query "${queryBuilderStore.queryId}"...`}</FetchingLoader>
          </div>
        )}
        {queryBuilderStore.saveError && (
          <div className={classes.saveErrorPanel}>
            <div>
              <h4>{queryBuilderStore.saveError}</h4>
              <div>
                <Button bsStyle="default" onClick={this.handleCancelSave}>Cancel</Button>
                <Button bsStyle="primary" onClick={this.handleSave}>Retry</Button>
              </div>
            </div>
          </div>
        )}
        {queryBuilderStore.compareChanges &&
              <Modal show={true} dialogClassName={classes.compareModal} onHide={this.handleToggleCompareChanges}>
                <Modal.Header closeButton>
                  <strong>{queryBuilderStore.queryId}</strong>
                </Modal.Header>
                <Modal.Body>
                  <div className={classes.comparison}>
                    <Scrollbars autoHide>
                      <pre>
                        {diff.map(part => {
                          if (!part.value) {
                            return null;
                          }
                          return (
                            <span key={part.value} className={part.added?classes.added:part.removed?classes.removed:classes.unchanged}>{part.value}</span>
                          );
                        })}
                      </pre>
                    </Scrollbars>
                  </div>
                </Modal.Body>
              </Modal>
        }
      </div>
    );
  }
}