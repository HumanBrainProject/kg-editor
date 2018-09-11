import React from "react";
import injectStyles from "react-jss";
import { inject, observer } from "mobx-react";

const styles = {
  pane: {
    position:"absolute",
    width:"50%",
    height:"100%",
    "--pane-index":"0",
    left:"calc(calc(50% * calc(var(--pane-index) - var(--selected-index))) + 25%)",
    overflow: "auto",
    background: "#ebebeb",
    boxShadow: "0 2px 10px #333",
    transform: "scale(0.90)",
    padding: "20px",
    transition: "left 0.5s ease, transform 0.5s ease",
    "&.active": {
      background: "#f5f5f5",
      transform: "scale(1)"
    },
    "&.main, &.main.active": {
      background: "white"
    },
    "&:hover": {
      zIndex: 2
    },
    "&.after:hover": {
      transform: "scale(0.95) translateX(-50%)"
    },
    "&.before:hover": {
      transform: "scale(0.95) translateX(50%)"
    },
    "& > div": {
      opacity: "0.75",
      transition: "opacity 0.25s ease"
    },
    "&.active > div, &.after:hover > div, &.before:hover > div": {
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

  render() {
    const { classes, paneStore } = this.props;
    const index = paneStore.panes.indexOf(this.paneId);
    const mainClass = index === 0 ? " main" : "";
    const activeClass = paneStore.selectedIndex < index ? "after" : paneStore.selectedIndex > index ? "before" : "active";
    return (
      <div className={`${classes.pane}${mainClass} ${activeClass}`} style={{"--pane-index":index}} onFocus={this.handleFocus} onClick={this.handleFocus} onMouseOver={this.handleMouseOver}>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
