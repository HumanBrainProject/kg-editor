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
import injectStyles from "react-jss";
import authStore from "../Stores/AuthStore";
import { Button } from "react-bootstrap";

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
  oidFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "var(--bg-color-ui-contrast2)"
  }
};

@injectStyles(styles)
export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showFrame: false };
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {authStore.expiredToken?
          <div className={classes.panel}>
            <h3>Your session has expired</h3>
            <p>
              Your session token has expired or has become invalid.<br/>
              Click on the following button to ask a new one and continue with your session.
            </p>
            <div>
              <Button bsStyle={"primary"} onClick={this.showFrame.bind(this)}>Re-Login</Button>
            </div>
          </div>
          :
          <div className={classes.panel}>
            <h3>Welcome to Knowledge Graph Editor</h3>
            <p>Please login to continue.</p>
            <div>
              <Button bsStyle={"primary"} onClick={this.showFrame.bind(this)}>Login</Button>
            </div>
          </div>
        }
        {this.state.showFrame &&
          <iframe className={classes.oidFrame} frameBorder="0" src={authStore.loginUrl} />
        }
      </div>
    );
  }

  showFrame() {
    this.setState({ showFrame: true });
  }
}
