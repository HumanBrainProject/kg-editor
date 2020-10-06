/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Field } from "hbp-quickfire";
import Status from "./Status";
// import BookmarkStatus from "./BookmarkStatus";
import { observer } from "mobx-react";

const styles = {
  container: {
    position: "relative",
    minHeight: "47px",
    cursor: "pointer",
    // padding: "10px 10px 10px 75px",
    padding: "10px",
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
    display: "flex",
    alignItems: "flex-end",
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
    width: "25px",
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

class Action extends React.PureComponent {
  handleClick = event => {
    const { mode, onClick, onCtrlClick } = this.props;
    event.stopPropagation();
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      typeof onCtrlClick === "function" && onCtrlClick(mode);
    } else {
      typeof onClick === "function" && onClick(mode);
    }
  }

  render() {
    const {className, show, icon} = this.props;

    if(!show) {
      return null;
    }

    return(
      <div className={className} onClick={this.handleClick}>
        <FontAwesomeIcon icon={icon} />
      </div>
    );
  }
}

@injectStyles(styles)
@observer
class InstanceRow extends React.Component {
  constructor(props) {
    super(props);
    this.timeout = null;
  }

  handleClick = event => {
    const { instance, onClick, onCtrlClick } = this.props;
    event.stopPropagation();
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if(this.timeout === null) {
      let action = typeof onClick === "function"?onClick:null;
      if (event.metaKey || event.ctrlKey) {
        action = typeof onCtrlClick === "function"?onCtrlClick:null;
      }
      if (action) {
        this.timeout = setTimeout((i, action) => action(i), 300, instance, action);
      }
    }
  }

  handleDoubleClick = event => {
    const { instance, onCtrlClick, onActionClick } = this.props;
    event.stopPropagation();
    clearTimeout(this.timeout);
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if ((event.metaKey || event.ctrlKey) && typeof onCtrlClick === "function") {
      onCtrlClick(instance);
    } else {
      typeof onActionClick === "function" && onActionClick(instance, "view");
    }
  }

  handleActionCtrlClick = () => {
    const { instance, onCtrlClick } = this.props;
    typeof onCtrlClick === "function" && onCtrlClick(instance);
  }

  handleActionClick = mode => {
    const { instance, onActionClick } = this.props;
    typeof onActionClick === "function" && onActionClick(instance, mode);
  }

  render() {
    const { classes, instance, selected } = this.props;
    const { permissions } = instance;
    const fields = Object.keys(instance.fields);
    return (
      <div className={`${classes.container} ${selected ? "selected" : ""}`} onClick={this.handleClick} onDoubleClick={this.handleDoubleClick} >
        <div className={classes.statusAndNameRow}>
          <Status id={instance.id} darkmode={true} />
          <div className={classes.type} style={instance.primaryType.color ? { color: instance.primaryType.color } : {}} title={instance.primaryType.name}>
            <FontAwesomeIcon fixedWidth icon="circle" />
          </div>
          <div className={classes.name}>{instance.name}</div>
        </div>
        <Form store={instance.formStore} >
          {fields.map(field => <Field name={field} key={field} />)}
        </Form>
        <div className={classes.actions}>
          <Action className={classes.action} show={permissions.canRead}                            icon="eye"              mode="view"    onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
          <Action className={classes.action} show={permissions.canWrite}                           icon="pencil-alt"       mode="edit"    onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
          <Action className={classes.action} show={permissions.canInviteForSuggestion}             icon="user-edit"        mode="invite"  onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
          <Action className={classes.action} show={permissions.canRead}                            icon="project-diagram"  mode="graph"   onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
          <Action className={classes.action} show={permissions.canRelease}                         icon="cloud-upload-alt" mode="release" onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
          <Action className={classes.action} show={permissions.canDelete || permissions.canCreate} icon="cog"              mode="manage"  onClick={this.handleActionClick} onCtrlClick={this.handleActionCtrlClick} />
        </div>
        {/* <BookmarkStatus id={instance.id} className="bookmarkStatus" /> */}
        {/* <div className={classes.separator}></div> */}
      </div>
    );
  }
}

export default InstanceRow;