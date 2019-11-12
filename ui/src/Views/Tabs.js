import React from "react";
import { observer } from "mobx-react";
import { matchPath } from "react-router-dom";
import injectStyles from "react-jss";

import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";
import routerStore from "../Stores/RouterStore";

import InstanceTabs from "./InstanceTabs";
import UserProfileTab from "./UserProfileTab";
import WorkspaceSelector from "../Components/WorkspaceSelector";
import Tab from "../Components/Tab";

const styles = {
  container: {
    background: "var(--bg-color-ui-contrast1)",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto"
  },
  fixedTabsLeft: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
  },
  fixedTabsRight: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
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
  userProfileTab: {
    width: "50px",
    height: "50px",
    lineHeight: "50px",
    color: "var(--ft-color-normal)",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderLeft: "none"
  }
};

@injectStyles(styles)
@observer
export default class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocationPathname: routerStore.history.location.pathname
    };
    routerStore.history.listen(location => {
      this.setState({ currentLocationPathname: location.pathname });
    });
  }

  handleGoToDashboard = () => {
    appStore.goToDashboard();
  }

  handleCreateInstance = () => {
    appStore.createInstance();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
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
                  <Tab icon={"home"} current={matchPath(this.state.currentLocationPathname, { path: "/", exact: "true" })} path={"/"} label={"Home"} hideLabel />
                  <Tab icon={"search"} current={matchPath(this.state.currentLocationPathname, { path: "/browse", exact: "true" })} path={"/browse"} hideLabel label={"Browse"} />
                  <Tab icon={"file"} onClick={this.handleCreateInstance} hideLabel label={"New instance"} />
                </React.Fragment>
                : null
              }
            </div>
            <InstanceTabs pathname={this.state.currentLocationPathname} />
            <div className={classes.fixedTabsRight}>
              {authStore.isFullyAuthenticated &&
                <React.Fragment>
                  <Tab icon={"question-circle"} current={matchPath(this.state.currentLocationPathname, { path: "/help", exact: "true" })} path={"/help"} hideLabel label={"Help"} />
                  <UserProfileTab className={classes.userProfileTab} size={32} />
                </React.Fragment>
              }
            </div>
          </React.Fragment>
        }
      </div>
    );
  }
}

