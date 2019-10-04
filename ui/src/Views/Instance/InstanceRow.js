import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormStore, Form, Field } from "hbp-quickfire";
import Status from "./Status";
import BookmarkStatus from "./BookmarkStatus";
import { observer } from "mobx-react";
import { normalizeInstanceData } from "../../Helpers/InstanceHelper";
import InstanceStore from "../../Stores/InstanceStore";
import { toJS } from "mobx";

const styles = {
  container: {
    position: "relative",
    minHeight: "47px",
    cursor: "pointer",
    padding: "10px 10px 10px 75px",
    //background:"var(--bg-color-ui-contrast3)",
    background: "var(--bg-color-ui-contrast2)",
    borderLeft: "4px solid transparent",
    color: "var(--ft-color-normal)",
    outline: "1px solid var(--border-color-ui-contrast1)",
    marginBottom: "11px",
    "&:hover": {
      background: "var(--list-bg-hover)",
      borderColor: "var(--list-border-hover)",
      color: "var(--ft-color-loud)",
      outline: "1px solid transparent",
      "& $actions": {
        opacity: 0.75
      },
      "& .status": {
        opacity: 1
      },
      "& $type": {
        opacity: "1"
      },
      "& .bookmarkStatus": {
        opacity: "1"
      }
    },
    "& .status": {
      marginRight: "13px",
      opacity: 0.5,
      verticalAlign: "text-top"
    },
    "&.selected": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)",
      outline: "1px solid transparent",
      "& .status": {
        opacity: "1"
      },
      "& $type": {
        opacity: "1"
      },
      "& .bookmarkStatus": {
        opacity: "1"
      }
    },
    "& .bookmarkStatus": {
      position: "absolute",
      top: "50%",
      left: "15px",
      transform: "translateY(-50%)",
      fontSize: "1.5em",
      opacity: "0.5",
      "& svg": {
        strokeWidth: "1.5em"
      }
    }
  },
  type: {
    display: "inline-block",
    opacity: "0.5",
    paddingRight: "8px",
    verticalAlign: "text-bottom",
  },
  name: {
    display: "inline",
    fontSize: "1.25em",
    fontWeight: "300",
    color: "var(--ft-color-louder)"
  },
  description: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    marginTop: "5px"
  },
  actions: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "125px",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    opacity: 0,
    "&:hover": {
      opacity: "1 !important"
    }
  },
  action: {
    fontSize: "0.9em",
    lineHeight: "27px",
    textAlign: "center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)"
    },
    "&:first-child": {
      borderRadius: "4px 0 0 4px"
    },
    "&:last-child": {
      borderRadius: "0 4px 4px 0"
    }
  },
  separator: {
    position: "absolute",
    top: "10px",
    left: "55px",
    height: "calc(100% - 20px)",
    borderRight: "1px solid var(--border-color-ui-contrast1)"
  },
  statusAndNameRow: {
    display: "flex",
    alignItems: "center"
  }
};

@injectStyles(styles)
@observer
export default class InstanceRow extends React.Component {
  handleClick(instance, event) {
    event.stopPropagation();
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      typeof this.props.onCtrlClick === "function" && this.props.onCtrlClick(instance);
    } else {
      typeof this.props.onClick === "function" && this.props.onClick(instance);
    }
  }

  handleDoubleClick(instance, event) {
    event.stopPropagation();
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      typeof this.props.onCtrlClick === "function" && this.props.onCtrlClick(instance);
    } else {
      typeof this.props.onActionClick === "function" && this.props.onActionClick(instance, "view");
    }
  }

  handleAction(mode, instance, event) {
    event.stopPropagation();
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      typeof this.props.onCtrlClick === "function" && this.props.onCtrlClick(instance, mode);
    } else {
      typeof this.props.onActionClick === "function" && this.props.onActionClick(instance, mode);
    }
  }

  render() {
    const { classes, instance, selected } = this.props;
    const transformField = field  =>  {
      if(field.type === "TextArea") {
        field.value = field.value.substr(0, 197) + "...";
        delete field.label;
      }
    };
    const normalizedInstanceData = normalizeInstanceData(toJS(instance), transformField);
    const formStore = new FormStore(normalizedInstanceData);
    formStore.toggleReadMode(true);
    const fields = Object.keys(instance.fields);
    return (
      <div className={`${classes.container} ${selected ? "selected" : ""}`}
        onClick={this.handleClick.bind(this, instance)}
        onDoubleClick={this.handleDoubleClick.bind(this, instance)} >
        <div className={classes.statusAndNameRow}>
          <Status id={instance.id} darkmode={true} />
          <div className={classes.type} style={normalizedInstanceData.primaryType.color ? { color: normalizedInstanceData.primaryType.color } : {}} title={normalizedInstanceData.primaryType.name}>
            <FontAwesomeIcon fixedWidth icon="circle" />
          </div>
          <div className={classes.name}>{normalizedInstanceData.name}</div>
        </div>
        <Form store={formStore} >
          {fields.map(field => <Field name={field} key={field} />)}
        </Form>
        <div className={classes.actions}>
          <div className={classes.action} onClick={this.handleAction.bind(this, "view", instance)}>
            <FontAwesomeIcon icon="eye" />
          </div>
          <div className={classes.action} onClick={this.handleAction.bind(this, "edit", instance)}>
            <FontAwesomeIcon icon="pencil-alt" />
          </div>
          <div className={classes.action} onClick={this.handleAction.bind(this, "graph", instance)}>
            <FontAwesomeIcon icon="project-diagram" />
          </div>
          <div className={classes.action} onClick={this.handleAction.bind(this, "release", instance)}>
            <FontAwesomeIcon icon="cloud-upload-alt" />
          </div>
          <div className={classes.action} onClick={this.handleAction.bind(this, "manage", instance)}>
            <FontAwesomeIcon icon="cog" />
          </div>
        </div>
        <BookmarkStatus id={instance.id} className="bookmarkStatus" />
        <div className={classes.separator}></div>
      </div>
    );
  }
}
