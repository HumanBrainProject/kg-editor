import React from "react";
import injectStyles from "react-jss";
import { inject, observer } from "mobx-react";

const styles = {
  pane: {
    overflow: "auto",
    background: "#ebebeb",
    boxShadow: "0 2px 10px #333",
    margin: "0",
    transform: "scale(0.90)",
    padding: "20px",
    transition: "all 0.5s ease",
    "@media screen and (min-width:992px)": {
      marginRight: "20px",
      marginLeft: "20px",
    },
    "&.active": {
      background: "#f5f5f5",
      transform: "scale(1)"
    },
    "&.main, &.main.active": {
      background: "white"
    },
    /*"&.after, &.before":{
      zIndex:2
    },*/
    "&:hover": {
      zIndex: 2
    },
    "&.after:hover": {
      background: "white",
      transform: "scale(0.95) translateX(-50%)",
      marginRight: "40px"
    },
    "&.before:hover": {
      background: "white",
      transform: "scale(0.95) translateX(50%)",
      marginLeft: "40px"
    },
    "& > div": {
      opacity: "0.75",
      transition: "all 0.5s ease"
    },
    "&.activing": {
      zIndex: "1000"
    },
    "&.active > div": {
      opacity: "1"
    },
    "&.after:hover > div": {
      opacity: "1"
    },
    "&.before:hover > div": {
      opacity: "1"
    }
  }
};

@injectStyles(styles)
@inject("paneStore")
@observer
export default class Pane extends React.Component {
  constructor(props) {
    super(props);
    this.paneId = this.props.paneStore.registerPane();
  }

  componentWillUnmount() {
    this.props.paneStore.unregisterPane(this.paneId);
  }

  handleFocus = () => {
    if (this.props.paneStore.selectedPane !== this.paneId) {
      this.props.paneStore.selectPane(this.paneId);
    }
  }

  handleMouseOver = () => {
    this.props.paneStore.resetSelectionChanged();
  }

  render() {
    const { classes, paneStore } = this.props;
    const index = paneStore.panes.indexOf(this.paneId);
    const mainClass = index === 0 ? " main" : "";
    const activeClass = paneStore.selectedIndex < index ? "after" : paneStore.selectedIndex > index ? "before" : "active";
    const onClass = paneStore.selectionChanged ? "activing" : "";
    return (
      <div className={`${classes.pane}${mainClass} ${activeClass} ${onClass}`} onFocus={this.handleFocus} onClick={this.handleFocus} onMouseOver={this.handleMouseOver}>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
