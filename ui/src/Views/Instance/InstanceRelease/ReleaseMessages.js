import React from "react";
import { observer } from "mobx-react";
import releaseStore from "../../../Stores/ReleaseStore";
import { Alert } from "react-bootstrap";
import injectStyles from "react-jss";
import { Scrollbars } from "react-custom-scrollbars";

const styles = {
  container: {
    width: "100%",
    height: "100%"
  },
  alert: {
    background: "var(--release-color-has-changed)",
    color: "black",
    borderColor: "transparent",
    paddingTop: "6px",
    paddingBottom: "6px",
    marginBottom: "10px"

  }
};

@injectStyles(styles)
@observer
class ReleaseMessages extends React.Component {
  render() {
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          {releaseStore.visibleWarningMessages.map(
            (message, index) => (
              <Alert
                key={`${message}-${index}`}
                className={classes.alert}
              >
                {message}
              </Alert>
            )
          )}
        </Scrollbars>
      </div>
    );
  }
}

export default ReleaseMessages;