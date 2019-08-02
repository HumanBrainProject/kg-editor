import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const styles = {
  container: {
    display: "flex",
    position: "absolute",
    top: 0,
    width: "100%",
    background: "hsla(191, 32%, 31%, 0.3)",
    color: "var(--ft-color-quiet)",
    padding: "5px 0 7px 20px",
    "& > svg": {
      transform: "translateY(3px)"
    },
    "& > h3": {
      margin: "0 10px",
      fontSize: "16px"
    },
    "& > button": {
      position: "absolute",
      right: 0,
      top: 0,
      height: "100%",
      padding: "5px 10px 5px 15px",
      textAlign: "right",
      background: "none",
      border: "0",
      cursor: "pointer",
      outline: "0",
      "&:hover": {
        color: "var(--ft-color-loud)"
      }
    }
  },
  tip: {
    flex: "1",
    "& .kbd": {
      display: "inline-block",
      margin: "0 0.1em",
      padding: "0.1em 0.6em",
      border: "1px solid #ccc",
      borderRadius: "3px",
      backgroundColor: "#f7f7f7",
      fontFamily: "Arial,Helvetica,sans-serif",
      fontSize: "11px",
      lineHeight: "1.4",
      color: "#333",
      boxShadow: "0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset",
      textShadow: "0 1px 0 #fff",
      whiteSpace: "nowrap"
    }
  },
  bookmarkIcon: {
    color: "var(--bookmark-on-color)"
  }
};

@injectStyles(styles)
@observer
export default class TipsOfTheDay extends React.Component {
  constructor(props){
    super(props);
    this.tips = [
      <span key="1">to create a new bookmark list click on the <FontAwesomeIcon icon="star" className={this.props.classes.bookmarkIcon} /> button of an instance and type the name of the new desired bookmark list.</span>,
      <span key="2">press <span className="kbd">Alt</span> + <span className="kbd">d</span> to show the dashboard.</span>,
      <span key="3">press <span className="kbd">Alt</span> + <span className="kbd">b</span> to browse the instances.</span>,
      <span key="4">press <span className="kbd">Ctrl</span> + click to open an instance in a new background tab.</span>,
      <span key="5">press <span className="kbd">Alt</span> + <span className="kbd">n</span> to create a new instance.</span>,
      <span key="6">press <span className="kbd">Alt</span> + <span className="kbd">w</span> to close current tab.</span>,
      <span key="7">press <span className="kbd">Alt</span> + <span className="kbd">Shift</span> + <span className="kbd">w</span> to close all tabs.</span>,
      <span key="8">press <span className="kbd">Alt</span> + <span className="kbd">&#8592;</span> to active previous tab.</span>,
      <span key="9">press <span className="kbd">Alt</span> + <span className="kbd">&#8594;</span> to active next tab.</span>,
      <span key="10">press <span className="kbd">Ctrl</span> + <span className="kbd">Alt</span> + <span className="kbd">t</span> to toggle theme.</span>
    ];
    this.state = { currentIndex: Math.floor(Math.random() * 10) % this.tips.length };
  }

  handleShowNextTip = () => {
    this.setState(state => ({currentIndex: (state.currentIndex + 1 === this.tips.length)?0:state.currentIndex + 1}));
  }

  render(){
    const { classes } = this.props;
    if (!this.tips.length) {
      return null;
    }
    return (
      <div className={classes.container}>
        <FontAwesomeIcon icon={"lightbulb"} />
        <h3>Tips of the day:</h3>
        <div className={classes.tip}>{this.tips[this.state.currentIndex]}</div>
        <button onClick={this.handleShowNextTip} title="show next tip"><FontAwesomeIcon icon="angle-right" /></button>
      </div>
    );
  }
}