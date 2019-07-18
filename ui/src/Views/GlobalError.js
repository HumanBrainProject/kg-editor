import React from "react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";

import appStore from "../Stores/AppStore";
import BGMessage from "../Components/BGMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  container: {
    height: "100%",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
export default class GlobalError extends React.Component {
  handleDismiss = () => {
    appStore.dismissGlobalError();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <BGMessage icon={"exclamation-circle"}>
          An unexpected error has occured.<br/>
          We recommend you to save all your changes and reload the application in your browser.<br/>
          If the problem persists, please contact the support.<br/><br/>
          <Button bsStyle={"primary"} onClick={this.handleDismiss}>
            <FontAwesomeIcon icon={"check"}/> &nbsp; Dismiss
          </Button>&nbsp;&nbsp;
          <Button bsStyle={"warning"} href={`mailto:kg-team@humanbrainproject.eu?subject=${
            encodeURIComponent("KG Editor: Unexpected error reporting")
          }&body=${
            encodeURIComponent(`User provided information: Please fill in a description of your error use case\n\nmessage:${
              appStore.globalError.error.message
            }\n\nstack:${
              appStore.globalError.error.stack
            }\n\nComponent Stack:${
              appStore.globalError.info.componentStack
            }`)
          }`}>
            <FontAwesomeIcon icon={"envelope"}/> &nbsp; Send an error report
          </Button>
        </BGMessage>
      </div>
    );
  }

  showFrame() {
    this.setState({ showFrame: true });
  }
}
