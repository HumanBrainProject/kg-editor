import React from "react";
import injectStyles from "react-jss";
import authStore from "../Stores/AuthStore";
import { Button } from "react-bootstrap";
import { uniqueId } from "lodash";

const animationId = uniqueId("animationId");

const styles = {
  container: {
    height: "100%",
    color: "white"
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
    background: "linear-gradient(165deg, #085078, #85d8ce)",
    backgroundSize: "cover",
    animation: `${animationId} 30s linear infinite`
  },
  [`@keyframes ${animationId}`]: {
    "0%": {
      transform: "translateX(0%) scale(1)"
    },
    "50%": {
      transform: "translateX(2%) scale(1.1)"
    },
    "100%": {
      transform: "translateX(0%) scale(1)"
    }
  },
  header: {
    position: "relative",
    padding: "20px",
    "& h1": {
      display: "inline-block",
      margin: 0,
      paddingLeft: "10px",
      verticalAlign: "middle",
      fontSize: "18px",
      "@media screen and (min-width:576px)": {
        fontSize: "28px"
      }
    }
  },
  panel: {
    position: "relative",
    width: "80%",
    margin: "20% 10% 80% 10%",
    padding: "20px",
    borderRadius: "5px",
    backgroundColor: "white",
    color: "#444",
    textAlign: "center",
    "@media screen and (min-width:992px)": {
      width: "auto",
      margin: "0",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    },
    "& h3": {
      marginTop: "0",
      fontSize: "18px",
      "@media screen and (min-width:992px)": {
        fontSize: "24px"
      }
    },
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
    background: "white"
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
        <div className={classes.header}>
          <img src={`${window.rootPath}/assets/HBP.png`} alt="" width="60" height="60" />
          <h1>Knowledge Graph Editor</h1>
        </div>
        <div className={classes.panel}>
          <h3>Welcome to Knowledge Graph Editor</h3>
          <p>Please login to continue.</p>
          <div>
            <Button onClick={this.showFrame.bind(this)}>Login</Button>
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
