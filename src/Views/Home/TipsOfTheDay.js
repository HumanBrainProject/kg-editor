import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const styles = {
  container: {
    padding: "15px",
    "& h3": {
      marginTop: "0"
    }
  },
  tip: {
    display: "flex",
    "& > div": {
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
    "& > button": {
      height: "100%",
      padding: "0 0 0 10px",
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
  noTipsOfTheDayPanel:{
    textAlign:"center",
    fontSize:"0.9em",
    wordBreak:"break-all",
    padding:"40px 20px",
    color:"var(--ft-color-loud)"
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
    this.state = { currentIndex: 0 };
    this.tips = [
      <span key="0">To open an instances list&#39;s item in a background tab press <span className="kbd">Ctrl</span> + click.</span>,
      <span key="1">To create a new bookmark list click on the <FontAwesomeIcon icon="star" className={this.props.classes.bookmarkIcon} /> button of an instnce and type the name of the new desired bookmark list.</span>,
      <span key="2">3rd tips of the day</span>,
      <span key="3">4th tips of the day</span>,
      <span key="4">5th tips of the day</span>
    ];
  }

  handleShowNextTip = () => {
    this.setState(state => ({currentIndex: (state.currentIndex + 1 === this.tips.length)?0:state.currentIndex + 1}));
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={`${classes.container} widget`}>
        <h3>Tips of the day</h3>
        {this.tips.length?
          <div className={classes.tip}>
            <div>{this.tips[this.state.currentIndex]}</div>
            <button onClick={this.handleShowNextTip} title="show next tip"><FontAwesomeIcon icon="angle-right" /></button>
          </div>
          :
          <div className={classes.noTipsOfTheDayPanel}>
            <div>No tips of the day available.</div>
          </div>
        }
      </div>
    );
  }
}