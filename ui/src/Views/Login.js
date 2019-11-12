import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";

import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";

const styles = {
  container: {
    height: "100%"
  },
  panel: {
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color:"var(--ft-color-loud)",
    padding: "0px 20px 20px 20px",
    borderRadius: "4px",
    textAlign: "center",
    width: "auto",
    margin: "0",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    "& p": {
      margin: "20px 0"
    }
  },
  loader: {
    position: "fixed",
    top: 0,
    left: 0,
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
  error: {
    color: "var(--ft-color-loud)",
    "& button + button": {
      marginLeft: "60px"
    }
  }
};

@injectStyles(styles)
@observer
export default class Login extends React.Component {
  handleLogin = () => authStore.login();

  handleRetryToInitialize() {
    appStore.initialize();
  }

  handleCancelInitialInstance() {
    appStore.cancelInitialInstance();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {!appStore.isInitialized?
          appStore.initializationError?
            <div className={classes.error}>
              <BGMessage icon={"ban"}>
                {`There was a problem initializing (${appStore.initializationError}).
                If the problem persists, please contact the support.`}<br /><br />
                <Button bsStyle={"primary"} onClick={this.handleRetryToInitialize}>
                  <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
                </Button>
              </BGMessage>
            </div>
            :
            appStore.initialInstanceError?
              <div className={classes.error}>
                <BGMessage icon={"ban"}>
                  {appStore.initialInstanceError}<br /><br />
                  <div>
                    <Button onClick={this.handleRetryToInitialize}>
                      <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
                    </Button>
                    <Button bsStyle={"primary"} onClick={this.handleCancelInitialInstance}>Continue</Button>
                  </div>
                </BGMessage>
              </div>
              :
              appStore.initialInstanceWorkspaceError?
                <div className={classes.error}>
                  <BGMessage icon={"ban"}>
                    {appStore.initialInstanceWorkspaceError}<br /><br />
                    <Button bsStyle={"primary"} onClick={this.handleCancelInitialInstance}>Continue</Button>
                  </BGMessage>
                </div>
                :
                appStore.initializingMessage?
                  <div className={classes.loader}>
                    <FetchingLoader>{appStore.initializingMessage}</FetchingLoader>
                  </div>
                  :
                  null
          :
          authStore.isTokenExpired?
            <div className={classes.panel}>
              <h3>Your session has expired</h3>
              <p>
                Your session token has expired or has become invalid.<br/>
                Click on the following button to ask a new one and continue with your session.
              </p>
              <div>
                <Button bsStyle={"primary"} onClick={this.handleLogin}>Re-Login</Button>
              </div>
            </div>
            :
            null
        }
      </div>
    );
  }
}