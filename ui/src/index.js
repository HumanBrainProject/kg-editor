import React from "react";
import { render } from "react-dom";
import { observer } from "mobx-react";
import { Router, Route, Switch, matchPath } from "react-router-dom";
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
import instanceStore from "./Stores/InstanceStore";
import instanceTabStore from "./Stores/InstanceTabStore";

import Tab from "./Components/Tab";
import SaveBar from "./Views/Instance/SaveBar";
import UserProfileTab from "./Views/UserProfileTab";

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
import WorkspaceSelector from "./Components/WorkspaceSelector";
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
  tabs: {
    background: "var(--bg-color-ui-contrast1)",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto"
  },
  fixedTabsLeft: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
  },
  dynamicTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 0.5fr))"
  },
  fixedTabsRight: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
  },
  body: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    backgroundSize: "200%"
  },
  logo: {
    padding: "10px",
    cursor: "pointer",
    "& span": {
      color: "var(--ft-color-loud)",
      display: "inline-block",
      paddingLeft: "10px",
      fontSize: "0.9em",
      borderLeft: "1px solid var(--border-color-ui-contrast5)",
      marginLeft: "10px"
    },
    "&:hover span": {
      color: "var(--ft-color-louder)"
    }
  },
  status: {
    background: "var(--bg-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    paddingLeft: "10px"
  },
  savebar: {
    position: "absolute",
    top: 0,
    right: "-400px",
    width: "400px",
    background: "var(--bg-color-ui-contrast3)",
    borderLeft: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    height: "100%",
    zIndex: 2,
    transition: "right 0.25s ease",
    "&.show": {
      right: "0",
    }
  },
  savebarToggle: {
    cursor: "pointer",
    position: "absolute",
    bottom: "10px",
    right: "100%",
    background: "linear-gradient(90deg, var(--bg-color-ui-contrast1), var(--bg-color-ui-contrast3))",
    borderRadius: "3px 0 0 3px",
    padding: "10px",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRight: "none",
    textAlign: "center",
    color: "#e67e22",
    "&:hover": {
      background: "var(--bg-color-ui-contrast3)"
    }
  },
  savebarToggleIcon: {
    animation: "pulse 2s linear infinite"
  },
  "@keyframes pulse": {
    "0%": {
      "transform": "scale(1.1)"
    },
    "50%": {
      "transform": "scale(0.8)"
    },
    "100%": {
      "transform": "scale(1.1)"
    }
  },
  userProfileTab: {
    width: "50px",
    height: "50px",
    lineHeight: "50px",
    color: "var(--ft-color-normal)",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderLeft: "none"
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
  newInstanceModal: {
    overflow: "hidden",
    width: "90%",
    "@media screen and (min-width:1024px)": {
      width: "900px",
    },
    "& .modal-body": {
      height: "calc(95vh - 52px)",
      padding: "3px 0",
      maxHeight: "calc(100vh - 210px)",
      overflowY: "auto"
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

  handleCloseInstance(instanceId) {
    appStore.closeInstance(instanceId);
  }

  handleGoToDashboard = () => {
    appStore.goToDashboard();
  }

  handleCreateInstance = () => {
    appStore.createInstance();
  }

  handleLogout = () => {
    appStore.logout();
  }

  render() {
    const { classes } = this.props;
    const Theme = appStore.availableThemes[appStore.currentTheme];
    return (
      <Router history={routerStore.history}>
        <div className={classes.layout}>
          <Theme />
          <div className={classes.tabs}>
            <div className={`${classes.logo} layout-logo`} onClick={this.handleGoToDashboard}>
              <img src={`${window.rootPath}/assets/ebrains.svg`} alt="" width="30" height="30" />
              <span>Knowledge Graph Editor</span>
            </div>
            {!appStore.globalError &&
              <React.Fragment>
                <div className={classes.fixedTabsLeft}>
                  {authStore.isFullyAuthenticated && authStore.hasWorkspaces && appStore.currentWorkspace?
                    <React.Fragment>
                      <WorkspaceSelector />
                      <Tab icon={"home"} current={matchPath(routerStore.history.location.pathname, { path: "/", exact: "true" })} path={"/"} label={"Home"} hideLabel />
                      <Tab icon={"search"} current={matchPath(routerStore.history.location.pathname, { path: "/browse", exact: "true" })} path={"/browse"} hideLabel label={"Browse"} />
                      <Tab icon={"file"} onClick={this.handleCreateInstance} hideLabel label={"New instance"} />
                    </React.Fragment>
                    : null
                  }
                </div>
                <div className={classes.dynamicTabs}>
                  {authStore.isFullyAuthenticated && Array.from(instanceTabStore.instanceTabs.keys()).map(instanceId => {
                    const instance = instanceStore.instances.get(instanceId);
                    const mode = instanceTabStore.instanceTabs.get(instanceId).viewMode;
                    let label;
                    let color = undefined;
                    if (instance && instance.isFetched) {
                      const labelField = instance.labelField;
                      const field = labelField && instance.form.getField(labelField);
                      label = field ? field.getValue() : instanceId;
                      color = instance.primaryType.color;
                    }
                    if (!label) {
                      label = instanceId;
                    }
                    return (
                      <Tab
                        key={instanceId}
                        icon={instance && instance.isFetching ? "circle-notch" : "circle"}
                        iconSpin={instance && instance.isFetching}
                        iconColor={color}
                        current={matchPath(routerStore.history.location.pathname, { path: `/instance/${mode}/${instanceId}`, exact: "true" })}
                        path={`/instance/${mode}/${instanceId}`}
                        onClose={this.handleCloseInstance.bind(this, instanceId)}
                        label={label} />
                    );
                  })}
                </div>
                <div className={classes.fixedTabsRight}>
                  {authStore.isFullyAuthenticated &&
                    <React.Fragment>
                      <Tab icon={"question-circle"} current={matchPath(routerStore.history.location.pathname, { path: "/help", exact: "true" })} path={"/help"} hideLabel label={"Help"} />
                      <UserProfileTab className={classes.userProfileTab} size={32} />
                    </React.Fragment>
                  }
                </div>
              </React.Fragment>
            }
          </div>
          <div className={classes.body}>
            {instanceStore.hasUnsavedChanges && !matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" }) &&
              <div className={`${classes.savebar} ${instanceStore.showSaveBar ? "show" : ""}`}>
                <div className={classes.savebarToggle} onClick={this.handleToggleSaveBar}>
                  <FontAwesomeIcon className={classes.savebarToggleIcon} icon={"exclamation-triangle"} />&nbsp;
                  <FontAwesomeIcon icon={"caret-down"} />&nbsp;
                  <FontAwesomeIcon icon={"pencil-alt"} />
                </div>
                <SaveBar />
              </div>
            }
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
