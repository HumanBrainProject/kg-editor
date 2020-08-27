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
import { render } from "react-dom";
import { observer } from "mobx-react";
import { Router, Route, Switch } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormStore } from "hbp-quickfire";
import { Button } from "react-bootstrap";
import injectStyles from "react-jss";

import "react-virtualized/styles.css";

import Cookies from "universal-cookie";

import "./Services/IconsImport";

import appStore from "./Stores/AppStore";
import authStore from "./Stores/AuthStore";
import routerStore from "./Stores/RouterStore";

import Tabs from "./Views/Tabs";
import SavePanel from "./Views/SavePanel";

import NotFound from "./Views/NotFound";
import Home from "./Views/Home";
import Login from "./Views/Login";
import Help from "./Views/Help";
// import Statistics from "./Views/Statistics";
import Browse from "./Views/Browse";
import Instance from "./Views/Instance";
import FetchingLoader from "./Components/FetchingLoader";
import GlobalError from "./Views/GlobalError";
import * as Sentry from "@sentry/browser";

import "babel-polyfill";
import "./CustomFields";
import WorkspaceModal from "./Views/WorkspaceModal";

FormStore.setPathNodeSeparator("|");

const styles = {
  "@global html, body, #root": {
    height: "100%",
    overflow: "hidden",
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-webkit-tap-highlight-color": "transparent",
    fontFamily: "Lato, sans-serif"
  },
  "@global *": {
    boxSizing: "border-box"
  },
  "@global button, @global input[type=button], @global a": {
    "-webkit-touch-callout": "none",
    userSelect: "none"
  },
  layout: {
    height: "100vh",
    display: "grid",
    overflow: "hidden",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr 20px"
  },
  body: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    backgroundSize: "200%"
  },
  status: {
    background: "var(--bg-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    paddingLeft: "10px"
  },
  deleteInstanceErrorModal: {
    "& .modal-dialog": {
      top: "35%",
      width: "max-content",
      maxWidth: "800px",
      "& .modal-body": {
        padding: "15px 25px",
        border: "1px solid var(--ft-color-loud)",
        borderRadius: "4px",
        color: "var(--ft-color-loud)",
        background: "var(--list-bg-hover)"
      }
    }
  },
  deleteInstanceError: {
    margin: "20px 0",
    color: "var(--ft-color-error)"
  },
  deleteInstanceErrorFooterBar: {
    marginBottom: "10px",
    width: "100%",
    textAlign: "center",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  deletingInstanceModal: {
    "& .modal-dialog": {
      top: "35%",
      width: "max-content",
      maxWidth: "800px",
      "& .modal-body": {
        padding: "30px",
        border: "1px solid var(--ft-color-loud)",
        borderRadius: "4px",
        color: "var(--ft-color-loud)",
        background: "var(--list-bg-hover)",
        "& .fetchingPanel": {
          position: "unset !important",
          top: "unset",
          left: "unset",
          width: "unset",
          transform: "none",
          wordBreak: "break-word",
          "& .fetchingLabel": {
            display: "inline"
          }
        }
      }
    }
  },
  noWorkspacesModal: {
    "&.modal-dialog": {
      marginTop: "40vh",
      "& .modal-body": {
        padding: "0 30px 15px 30px",
        fontSize: "1.6rem",
        "@media screen and (min-width:768px)": {
          whiteSpace: "nowrap"
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
class App extends React.Component {
  componentDidMount() {
    appStore.initialize();
    document.addEventListener("keydown", appStore.handleGlobalShortcuts);
    // Init of sentry (logs) bucket
    const cookies = new Cookies();
    const sentryUrl = cookies.get("sentry_url");
    if (sentryUrl) {
      Sentry.init({
        dsn: sentryUrl
      });
    }
  }

  componentDidCatch(error, info) {
    appStore.setGlobalError(error, info);
  }

  handleToggleSaveBar = () => {
    appStore.toggleSavebarDisplay();
  }

  handleRetryDeleteInstance = async () => {
    appStore.retryDeleteInstance();
  }

  handleCancelDeleteInstance = () => {
    appStore.cancelDeleteInstance();
  }

  render() {
    const { classes } = this.props;
    const Theme = appStore.availableThemes[appStore.currentTheme];
    return (
      <Router history={routerStore.history}>
        <div className={classes.layout}>
          <Theme />
          <Tabs />
          <div className={classes.body}>
            <SavePanel />
            {appStore.globalError ?
              <Route component={GlobalError} />
              :
              !appStore.isInitialized || !authStore.isAuthenticated ?
                <Route component={Login} />
                :
                authStore.hasWorkspaces?
                  appStore.currentWorkspace?
                    <Switch>
                      <Route path="/instance/create/:id*" render={(props) => (<Instance {...props} mode="create" />)} />
                      <Route path="/instance/view/:id*" render={(props) => (<Instance {...props} mode="view" />)} />
                      <Route path="/instance/edit/:id*" render={(props) => (<Instance {...props} mode="edit" />)} />
                      <Route path="/instance/invite/:id*" render={(props) => (<Instance {...props} mode="invite" />)} />
                      <Route path="/instance/graph/:id*" render={(props) => (<Instance {...props} mode="graph" />)} />
                      <Route path="/instance/release/:id*" render={(props) => (<Instance {...props} mode="release" />)} />
                      <Route path="/instance/manage/:id*" render={(props) => (<Instance {...props} mode="manage" />)} />

                      <Route path="/browse" exact={true} component={Browse} />
                      <Route path="/help" component={Help} />
                      {/* <Route path="/kg-stats" exact={true} component={Statistics} /> */}
                      <Route path="/" exact={true} component={Home} />
                      <Route component={NotFound} />
                    </Switch>
                    :
                    <Route component={WorkspaceModal} />
                  :
                  <Modal dialogClassName={classes.noWorkspacesModal} show={true}>
                    <Modal.Body>
                      <h1>Welcome <span title={name}>{name}</span></h1>
                      <p>You are currently not granted permission to acccess any workspaces.</p>
                      <p>Please contact our team by email at : <a href={"mailto:kg-team@humanbrainproject.eu"}>kg-team@humanbrainproject.eu</a></p>
                    </Modal.Body>
                  </Modal>
            }
          </div>
          {authStore.isFullyAuthenticated && (
            <React.Fragment>
              {appStore.deleteInstanceError ?
                <div className={classes.deleteInstanceErrorModal}>
                  <Modal.Dialog>
                    <Modal.Body>
                      <div className={classes.deleteInstanceError}>{appStore.deleteInstanceError}</div>
                      <div className={classes.deleteInstanceErrorFooterBar}>
                        <Button onClick={this.handleCancelDeleteInstance}>Cancel</Button>
                        <Button bsStyle="primary" onClick={this.handleRetryDeleteInstance}><FontAwesomeIcon icon="redo-alt" />&nbsp;Retry</Button>
                      </div>
                    </Modal.Body>
                  </Modal.Dialog>
                </div>
                :
                appStore.isDeletingInstance && !!appStore.instanceToDelete ?
                  <div className={classes.deletingInstanceModal}>
                    <Modal.Dialog>
                      <Modal.Body>
                        <FetchingLoader>{`Deleting instance "${appStore.instanceToDelete}" ...`}</FetchingLoader>
                      </Modal.Body>
                    </Modal.Dialog>
                  </div>
                  : null
              }
            </React.Fragment>
          )}
          <div className={`${classes.status} layout-status`}>
              Copyright &copy; {new Date().getFullYear()} EBRAINS. All rights reserved.
          </div>
        </div>
      </Router>
    );
  }
}

render(<App />, document.getElementById("root"));
