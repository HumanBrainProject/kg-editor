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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import MultiToggle from "../../../Components/MultiToggle";
import Color from "color";
import { Glyphicon } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import routerStore from "../../../Stores/RouterStore";
import graphStore from "../../../Stores/GraphStore";
import appStore from "../../../Stores/AppStore";

const styles = {
  container: {
    height: "100%"
  },
  groups: {

  },
  group: {
    position: "relative",
    height: "45px",
    padding: "0 10px",
    "&:nth-child(odd)": {
      background: "var(--bg--color-ui-contrast3)"
    },
    overflow: "hidden",
    transition: "height 0.25s ease-in-out",
    "&.expanded": {
      height: "auto",
      "& $expandButton": {
        transform: "rotateZ(90deg)"
      }
    },
    "&.disabled": {
      opacity: "0.2",
      display: "none"
    }
  },
  groupActions: {
    position: "absolute",
    right: "10px",
    top: "10px",
    fontSize: "1.25em"
  },
  groupLabel: {
    lineHeight: "45px",
    color: "var(--ft-color-normal)",
    cursor: "pointer",
    "&:hover": {
      color: "var(--ft-color-loud)",
    }
  },
  typeIcon: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    margin: "0 4px 2px 8px",
    borderRadius: "50%",
    background: "white",
    border: "2px solid gray",
    verticalAlign: "middle",
    zIndex: 2
  },
  nodes: {
    paddingBottom: "10px",
    paddingLeft: "30px"
  },
  node: {
    padding: "5px 0",
    position: "relative",
    cursor: "pointer",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)",
    },
    "&::before": {
      content: "''",
      display: "block",
      position: "absolute",
      left: -23,
      top: -15,
      height: 32,
      width: 1,
      borderLeft: "1px dashed #bdc3c7"
    },
    "&::after": {
      content: "''",
      display: "block",
      position: "absolute",
      left: -22,
      top: 16,
      width: "17px",
      height: 1,
      borderBottom: "1px dashed #bdc3c7"
    }
  },
  expandButton: {
    color: "#bdc3c7",
    cursor: "pointer",
    transition: "transform 0.25s ease-in-out"
  }
};
@injectStyles(styles)
class Node extends React.Component {

  handelMouseOver = () => {
    const { node } = this.props;
    graphStore.setHighlightNodeConnections(node, true);
  }

  handelMouseOut = () => {
    const { node } = this.props;
    graphStore.setHighlightNodeConnections(node, false);
  }

  handelClick = () => {
    const { node } = this.props;
    if (node.id !== graphStore.mainId) {
      graphStore.reset();
      routerStore.history.push(`/instances/${node.id}/graph`);
    }
  }

  render() {
    const { classes, node, isGrouped } = this.props;
    let actions = {onClick: this.handleClick};
    if(!isGrouped) {
      actions = {
        onMouseOver: this.handelMouseOver,
        onMouseOut: this.handelMouseOut,
        onClick: this.handleClick
      };
    }
    return (
      <div className={classes.node} {...actions}>{node.name} {node.workspace !== appStore.currentWorkspace.id? <em style={{color:"var(--ft-color-error)"}}>(Workspace: {node.workspace})</em> : null}</div>
    );
  }
}

const Nodes = ({className, nodes, isGrouped}) => (
  <div className={className}>
    {nodes.map(node => (
      <Node key={node.id} node={node} isGrouped={isGrouped} />
    ))}
  </div>
);

@injectStyles(styles)
class TypeIcon extends React.Component {
  render() {
    const {classes, color, grouped} = this.props;

    const style = {
      borderRadius: grouped?"0":"50%",
      background: color,
      borderColor: new Color(color).darken(0.25).hex()
    };

    return (
      <div className={classes.typeIcon} style={style} />
    );
  }
}

const Type = ({type, defaultColor, grouped}) => (
  <span>
    <TypeIcon color={type.color?type.color:defaultColor} grouped={grouped} />
    {type.label}
  </span>
);

@observer
class GroupLabel extends React.Component {

  handelMouseOver = () => {
    const { group } = this.props;
    graphStore.setHighlightNodeConnections(group, true);
  }

  handelMouseOut = () => {
    const { group } = this.props;
    graphStore.setHighlightNodeConnections(group, false);
  }

  render() {
    const { className, group } = this.props;
    let actions = {};
    if(group.grouped) {
      actions = {
        onMouseOver: this.handelMouseOver,
        onMouseOut: this.handelMouseOut
      };
    }

    return (
      <span className={className}  {...actions}>
        {group.types.map(type => (
          <Type key={type.name} type={type} grouped={group.grouped} />
        ))}
      </span>
    );
  }
}

@observer
class Actions extends React.Component {

  handleChange = action => {
    const { group } = this.props;
    switch (action) {
    case "show":
      graphStore.setGroupVisibility(group, true);
      break;
    case "hide":
      graphStore.setGroupVisibility(group, false);
      break;
    case "group":
      graphStore.setGrouping(group, true);
      break;
    case "ungroup":
      graphStore.setGrouping(group, false);
      break;
    }
  }

  render() {
    const { className, group } = this.props;

    let value = group.show?"show":"hide";
    let actions = [
      {value: "show", icon:"eye"},
      {value: "hide", icon:"eye-slash"}
    ];
    if (group.show && group.nodes.length > 1) {
      value = group.grouped?"group":"ungroup";
      actions = [
        {value: "group",   icon: "compress"},
        {value: "ungroup", icon: "expand-arrows-alt"},
        {value: "hide",    icon: "eye-slash"}
      ];
    }

    return (
      <div className={className}>
        <MultiToggle selectedValue={value} onChange={this.handleChange}>
          {actions.map(action => (
            <MultiToggle.Toggle key={action.value} color={"var(--ft-color-loud)"} value={action.value} icon={action.icon} />
          ))}
        </MultiToggle>
      </div>
    );
  }
}

@injectStyles(styles)
class Group extends React.Component {

  constructor(props) {
    super(props);
    this.state = { expanded: false};
  }

  handleClick = () => {
    this.setState(state => ({ expanded: !state.expanded}));
  }

  render() {
    const { classes, group } = this.props;
    return (
      <div className={`${classes.group} ${this.state.expanded ? "expanded" : ""}`}>
        <Glyphicon glyph="chevron-right" className={classes.expandButton} onClick={this.handleClick} />
        <GroupLabel className={classes.groupLabel} group={group} />
        <Actions className={classes.groupActions} group={group} />
        {this.state.expanded && (
          <Nodes className={classes.nodes} nodes={group.nodes} isGrouped={group.grouped} />
        )}
      </div>
    );
  }
}

const Groups = ({className, groups}) => (
  <div className={className}>
    {groups.map(group => (
      <Group key={group.id} group={group} />
    ))}
  </div>
);

@injectStyles(styles)
@observer
class GraphSettings extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          {graphStore.isFetched && (
            <Groups className={classes.groups} groups={graphStore.groupsList} />
          )}
        </Scrollbars>
      </div>
    );
  }
}

export default GraphSettings;