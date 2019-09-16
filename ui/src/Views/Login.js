import React from "react";
import injectStyles from "react-jss";
import API from "../Services/API";
import authStore from "../Stores/AuthStore";

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
    authStore.storeState();
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
              <a className="btn btn-primary" href={API.endpoints.login()}>Re-Login</a>
            </div>
          </div>
          :
          <div className={classes.panel}>
            <h3>Welcome to Knowledge Graph Editor</h3>
            <p>Please login to continue.</p>
            <div>
              <a className="btn btn-primary" href={API.endpoints.login()}>Login</a>
            </div>
          </div>
        }
      </div>
    );
  }
}
