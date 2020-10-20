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
import { createUseStyles } from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";

import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";

const useStyles = createUseStyles({
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
});

const Login = observer(() => {

  const classes = useStyles();

  const handleLogin = () => appStore.login();

  const handleRetryToInitialize = () => {
    appStore.initialize();
  };

  const handleCancelInitialInstance = () => {
    appStore.cancelInitialInstance();
  };

  if (!appStore.isInitialized) {

    if (appStore.initializationError) {
      return (
        <div className={classes.container}>
          <div className={classes.error}>
            <BGMessage icon={"ban"}>
              {`There was a problem initializing (${appStore.initializationError}).
                If the problem persists, please contact the support.`}<br /><br />
              <Button bsStyle={"primary"} onClick={handleRetryToInitialize}>
                <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
              </Button>
            </BGMessage>
          </div>
        </div>
      );
    }

    if (appStore.initialInstanceError) {
      return (
        <div className={classes.container}>
          <div className={classes.error}>
            <BGMessage icon={"ban"}>
              {appStore.initialInstanceError}<br /><br />
              <div>
                <Button onClick={handleRetryToInitialize}>
                  <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
                </Button>
                <Button bsStyle={"primary"} onClick={handleCancelInitialInstance}>Continue</Button>
              </div>
            </BGMessage>
          </div>
        </div>
      );
    }

    if (appStore.initialInstanceWorkspaceError) {
      return (
        <div className={classes.container}>
          <div className={classes.error}>
            <BGMessage icon={"ban"}>
              {appStore.initialInstanceWorkspaceError}<br /><br />
              <Button bsStyle={"primary"} onClick={handleCancelInitialInstance}>Continue</Button>
            </BGMessage>
          </div>
        </div>
      );
    }

    if (appStore.initializingMessage) {
      return (
        <div className={classes.container}>
          <div className={classes.loader}>
            <FetchingLoader>{appStore.initializingMessage}</FetchingLoader>
          </div>
        </div>
      );
    }

    return (
      <div className={classes.container}>
        <div className={classes.panel}>
          <h3>You are logged out of the application</h3>
          <p></p>
          <div>
            <Button bsStyle={"primary"} onClick={handleLogin}>Login</Button>
          </div>
        </div>
      </div>
    );

  }

  if (authStore.isTokenExpired && !authStore.isLogout) {
    return (
      <div className={classes.container}>
        <div className={classes.panel}>
          <h3>Your session has expired</h3>
          <p>
              Your session token has expired or has become invalid.<br/>
              Click on the following button to ask a new one and continue with your session.
          </p>
          <div>
            <Button bsStyle={"primary"} onClick={handleLogin}>Re-Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}></div>
  );
});

export default Login;