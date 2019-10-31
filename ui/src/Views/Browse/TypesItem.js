import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import _ from "lodash-uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import browseStore from "../../Stores/BrowseStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";


const styles = {
  container: {
    padding: "5px 5px 5px 30px",
    borderLeft: "2px solid transparent",
    color: "var(--ft-color-normal)",
    cursor: "pointer",
    position: "relative",
    "&:hover": {
      background: "var(--list-bg-hover)",
      borderColor: "var(--list-border-hover)",
      color: "var(--ft-color-loud)",
      "& $actions": {
        opacity: 0.75
      },
      "& $createInstance": {
        position: "absolute",
        top: "0",
        right: "0",
        height: "100%",
        padding: "5px 10px",
        display: "block",
        color: "var(--ft-color-normal)",
        "&:hover": {
          color: "var(--ft-color-loud)",
        }
      }
    },
    "&.selected": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)"
    },
    "&.edited": {
      padding: "0 5px 0 30px"
    },
    "&.disabled": {
      pointerEvents: "none",
      opacity: "0.8"
    }
  },
  icon: {
    position: "absolute",
    top: "8px",
    "& + span": {
      display: "inline-block",
      marginLeft: "22px"
    }
  },
  actions: {
    position: "absolute",
    top: "2px",
    right: "10px",
    display: "grid",
    opacity: 0,
    width: "25px",
    gridTemplateColumns: "repeat(1, 1fr)",
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
    },
    "&:first-child:last-child": {
      borderRadius: "4px"
    }
  },
  deleteBookmarkDialog: {
    position: "absolute",
    top: 0,
    right: "-200px",
    transition: "right .2s ease",
    "&.show": {
      right: "5px"
    }
  },
  error: {
    position: "absolute",
    top: "5px",
    right: "10px",
  },
  errorButton: {
    color: "var(--ft-color-error)"
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
export default class TypesItem extends React.Component {
  handleSelect = event => {
    event && event.stopPropagation();
    browseStore.selectItem(this.props.type);
  }

  handleCreateInstance = () => {
    const uuid = _.uuid();
    routerStore.history.push(`/instance/create/${uuid}`);
  }

  render() {
    const { classes, type } = this.props;
    const selected = browseStore.selectedItem === type;
    const color = type.color;
    return (
      <div
        key={type.id}
        className={`${classes.container} ${selected ? "selected" : ""} ${browseStore.isFetching.instances?"disabled":""}`}
        onClick={this.handleSelect} title={type.label}>
        {color ?
          <FontAwesomeIcon fixedWidth icon="circle" className={`${classes.icon} ${classes.typeIcon}`} style={{ color: color }} />
          :
          <FontAwesomeIcon icon={"code-branch"} className={`${classes.icon} ${classes.typeIcon}`} />
        }
        <span>{type.label}</span>
        {instanceStore.isCreatingNewInstance ?
          <div className={classes.createInstance}>
            <FontAwesomeIcon icon={"circle-notch"} spin />
          </div>
          :
          <div className={classes.actions}>
            <div className={classes.action} onClick={this.handleCreateInstance} title={`create a new ${type.label}`}>
              <FontAwesomeIcon icon={"plus"} />
            </div>
          </div>
        }
      </div>
    );


  }
}