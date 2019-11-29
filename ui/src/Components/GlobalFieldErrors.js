
import React from "react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Sentry from "@sentry/browser";

const styles = {
  container: {
    height: "100%",
    color: "var(--ft-color-error)",
    "& h4": {
      marginTop: "30px"
    }
  },
  errorReport: {
    textAlign: "center",
    margin: "30px 0"
  }
};

@injectStyles(styles)
class GlobalFieldErrors extends React.Component {
  render() {
    const { classes, instance } = this.props;
    return (
      <div className={classes.container}>
        <h4>
          {`The ${instance.primaryTypeLabel?instance.primaryTypeLabel:"instance"} ${instance.id} could not be rendered because it contains unexpected type of values in the below fields:`}
        </h4>
        <ul>
          {instance.fieldErrors.map(field =>
            <li key={field.path}>
              {field.label} ({field.path.substr(1)}) with value {JSON.stringify(field.value)}
            </li>
          )}
        </ul>
        <div className={classes.errorReport}>
          <Button bsStyle={"warning"} onClick={() => Sentry.showReportDialog({ title: "An unexpected error has occured.", subtitle2: "We recommend you to save all your changes and reload the application in your browser. The KG team has been notified. If you'd like to help, tell us what happened below.", labelEmail: "Email(optional)", labelName: "Name(optional)", user: { email: "error@kgeditor.com", name: "Error Reporter" }, labelComments: "Please fill in a description of your error use case" })}>
            <FontAwesomeIcon icon={"envelope"} /> &nbsp; Send an error report
          </Button>
        </div>
      </div >
    );
  }

  showFrame() {
    this.setState({ showFrame: true });
  }
}

export default GlobalFieldErrors;
