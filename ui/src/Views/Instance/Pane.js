import React from "react";
import injectStyles from "react-jss";
import { inject, observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import { debounce } from "lodash";

const styles = {
  pane: {
    position:"absolute",
    width:"50%",
    height:"calc(100% - 40px)",
    top:"20px",
    "--pane-index":"0",
    left:"calc(calc(50% * calc(var(--pane-index) - var(--selected-index))) + 25%)",
    overflow: "auto",
    background: "#ebebeb",
    boxShadow: "0 2px 10px var(--pane-box-shadow)",
    transform: "scale(0.90)",
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
  },
  scrolledView:{
    padding:"20px",
  }
};

@injectStyles(styles)
@inject("paneStore")
@observer
class Pane extends React.Component {
  constructor(props) {
    super(props);
    this.props.paneStore.registerPane(this.props.paneId);
  }

  componentWillUnmount() {
    this.props.paneStore.unregisterPane(this.props.paneId);
  }

  componentDidUpdate(){
    if (this.props.paneStore.selectedPane !== this.props.paneId) {
      this.paneRef.style.pointerEvents = "none";
      this.restorePointerEvents();
    } else {
      this.paneRef.style.pointerEvents = "auto";
      this.restorePointerEvents.cancel();
    }
  }

  restorePointerEvents = debounce(() => {
    this.paneRef ? this.paneRef.style.pointerEvents = "auto":null;
  }, 1000);

  handleFocus = () => {
    if (this.props.paneStore.selectedPane !== this.props.paneId) {
      this.props.paneStore.selectPane(this.props.paneId);
    }
  }

  render() {
    const { classes, paneStore, paneId } = this.props;
    const index = paneStore.panes.indexOf(paneId);
    const mainClass = index === 0 ? " main" : "";
    const activeClass = paneStore.selectedIndex < index ? "after" : paneStore.selectedIndex > index ? "before" : "active";
    return (
      <div ref={ref => this.paneRef = ref} className={`${classes.pane}${mainClass} ${activeClass}`} style={{"--pane-index":index}} onFocus={this.handleFocus} onClick={this.handleFocus}>
        <Scrollbars autoHide>
          <div className={classes.scrolledView}>
            {this.props.children}
          </div>
        </Scrollbars>
      </div>
    );
  }
}

export default Pane;