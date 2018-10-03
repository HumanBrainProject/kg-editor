import React from "react";
import injectStyles from "react-jss";
import authStore from "../Stores/AuthStore";
import { Button } from "react-bootstrap";

const styles = {
  container: {
    height: "100%"
  },
  backgroundPanel: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },
  background: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    backgroundSize: "cover",
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
        <div className={classes.backgroundPanel}><div className={classes.background}></div></div>
        <div className={classes.panel}>
          <h3>Welcome to Knowledge Graph Editor</h3>
          <p>Please login to continue.</p>
          <div>
            <Button bsStyle={"primary"} onClick={this.showFrame.bind(this)}>Login</Button>
          </div>
        </div>
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
