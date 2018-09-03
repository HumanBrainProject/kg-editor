import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";

const styles = {
  menu: {
    display: "none",
    zIndex: 1000,
    position: "absolute",
    overflow: "hidden",
    border: "1px solid #CCC",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
    background: " #FFF",
    color: "#333",
    borderRadius: "5px",
    padding: 0,
    "& li": {
      padding: " 8px 12px",
      cursor: "pointer",
      "list-style-type": "none",
      transition: "all .3s ease",
      "user-select": "none",
      "&:hover": {
        backgroundColor: "#DEF"
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class GraphContextMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      style: props.style
    };
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.setState({style: newProps.style});
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <ul style={this.state.style} className={classes.menu}>
          <li onClick={this.props.handleMenuClick} data-action="regroup">Regroup nodes</li>
          <li onClick={this.props.handleMenuClick} data-action="delete">Delete node </li>
          <li onClick={this.props.handleMenuClick} data-action="third">Third thing </li>
        </ul>
      </div>
    );

  }

}