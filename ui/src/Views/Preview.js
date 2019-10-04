import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Form, Field } from "hbp-quickfire";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import instanceStore from "../Stores/InstanceStore";

import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";
import Status from "./Instance/Status";
import BookmarkStatus from "./Instance/BookmarkStatus";
import RenderMarkdownField from "../Components/Markdown";
import Actions from "./Preview/Actions";
import GlobalFieldErrors from "../Components/GlobalFieldErrors";

const styles = {
  container: {
    height: "100%",
    padding: "10px 0",
    "& .quickfire-field-checkbox .quickfire-label": {
      "&:after": {
        display: "none"
      },
      "& + .checkbox": {
        display: "inline-block",
        margin: "0 0 0 4px",
        verticalAlign: "middle",
        "& label input[type=checkbox]": {
          fontSize: "16px"
        }
      },
      "& + span": {
        verticalAlign: "text-bottom",
        "& input[type=checkbox]": {
          fontSize: "16px",
          marginTop: "0"
        }
      }
    },
    "&.hide-empty-fields .quickfire-empty-field": {
      display: "none"
    }
  },
  content: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "100%",
    height: "100%",
    "& > .header": {
      padding: "0 10px"
    },
    "& .quickfire-form": {
      padding: "0 10px"
    },
    "& .popover-popup": {
      display: "none !important"
    },
    "&:hover .popover-popup": {
      display: "block !important"
    }
  },
  status: {
    position: "absolute",
    top: "6px",
    right: "-54px",
    fontSize: "25px"
  },
  bookmarkStatus: {
    marginRight: "5px",
    fontSize: "1em"
  },
  type: {
    display: "inline-block",
    paddingRight: "8px",
    verticalAlign: "text-bottom",
  },
  titlePanel: {
    position: "relative",
    width: "calc(100% - 70px)"
  },
  title: {
    fontSize: "1.5em",
    fontWeight: "300"
  },
  metadataTitle: {
    display: "inline-block",
    marginBottom: "10px"
  },
  id: {
    fontSize: "0.75em",
    color: "var(--ft-color-normal)",
    marginTop: "20px",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "10px",
    wordBreak: "break-word"
  },
  duplicate: {
    extend: "action"
  },
  errorReport: {
    margin: "10px"
  }
};

@injectStyles(styles)
@observer
export default class Preview extends React.Component {

  componentDidMount() {
    if (this.props.instanceId) {
      this.fetchInstance();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instanceId && prevProps.instanceId !== this.props.instanceId) {
      this.fetchInstance();
    }
  }

  fetchInstance(forceFetch=false) {
    const instance = instanceStore.createInstanceOrGet(this.props.instanceId);
    instance.fetch(forceFetch);
  }

  handleRetry = () => {
    this.fetchInstance(true);
  }

  markdownDescriptionRendering = field => (
    <RenderMarkdownField value={field.getValue()} />
  );

  render() {
    const { classes, className, instanceId, instanceName, showEmptyFields=true, showAction=true, showBookmarkStatus=true, showTypes=false, showStatus=true, showMetaData=true } = this.props;

    const instance = instanceId?instanceStore.instances.get(instanceId):null;
    if (!instance) {
      return null;
    }

    const promotedFields = instance && instance.promotedFields;
    const promotedFieldsWithMarkdown =
      instance && instance.promotedFieldsWithMarkdown;
    const nonPromotedFields =
      instance && instance.nonPromotedFields;
    return (
      <div className={`${classes.container} ${showEmptyFields?"":"hide-empty-fields"}  ${className?className:""}`}>
        {(!instance.isFetched || instance.isFetching)? (
          <FetchingLoader>
            <span>Fetching instance information...</span>
          </FetchingLoader>
        ) : !instance.hasFetchError ? (
          <div className={classes.content}>
            <div className="header">
              {showAction && (
                <Actions instanceId={instanceId} />
              )}
              <div className={classes.titlePanel}>
                {showBookmarkStatus && (
                  <BookmarkStatus className={classes.bookmarkStatus} id={instanceId} />
                )}
                {showTypes && (
                  <div className={classes.type} style={instance.primaryType.color ? { color: instance.primaryType.color } : {}} title={instance.primaryType.name}>
                    <FontAwesomeIcon fixedWidth icon="circle" />
                  </div>
                )}
                <span className={classes.title}>
                  {instanceName?instanceName:instance.name}
                </span>
                {showStatus && (
                  <div className={`${classes.status}`}>
                    <Status
                      darkmode={true}
                      id={instanceId}
                    />
                  </div>
                )}
              </div>
              <div className={classes.id}>
                ID: {instanceId}
              </div>
            </div>
            <Scrollbars autoHide>
              {instance.hasFieldErrors ? <div className={classes.errorReport}><GlobalFieldErrors instance={instance} /> </div>:
                <Form
                  store={instance.readModeFormStore}
                  key={instanceId}
                >
                  {promotedFields.map(fieldKey => {
                    return (
                      <div
                        key={instanceId + fieldKey}
                        className={classes.field}
                      >
                        {promotedFieldsWithMarkdown.includes(fieldKey) ? (
                          <Field
                            name={fieldKey}
                            readModeRendering={this.markdownDescriptionRendering}
                          />
                        ) : (
                          <Field name={fieldKey} />
                        )}
                      </div>
                    );
                  })}
                  {nonPromotedFields.map(fieldKey => {
                    return (
                      <div
                        key={instanceId + fieldKey}
                        className={classes.field}
                      >
                        <Field name={fieldKey} />
                      </div>
                    );
                  })}
                  {showMetaData && instance.metadata && instance.metadata.length > 0 && (
                    <div>
                      <hr />
                      <span
                        className={`${classes.title} ${classes.metadataTitle}`}
                      >
                        {" "}
                      Metadata{" "}
                      </span>
                      {instance.metadata.map(field => (
                        <div
                          key={instanceId + field.label}
                          className={classes.field}
                        >
                          <label>{field.label}: </label> {field.value}
                        </div>
                      ))}
                    </div>
                  )}
                </Form>}
            </Scrollbars>
          </div>
        ) : (
          <BGMessage icon={"ban"}>
              There was a network problem fetching the instance.
            <br />
              If the problem persists, please contact the support.
            <br />
            <small>{instance.fetchError}</small>
            <br />
            <br />
            <Button bsStyle={"primary"} onClick={this.handleRetry}>
              <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
            </Button>
          </BGMessage>
        )}
      </div>
    );
  }
}
