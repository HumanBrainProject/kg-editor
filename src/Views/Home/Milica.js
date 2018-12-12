import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";


const styles = {
  container: {
    overflow: "hidden",
    position: "relative",
    height: "0",
    color: "var(--ft-color-louder)",
    background: "none",
    border: "1px solid transparent",
    borderRadius: "12px",
    animationName: "animationContainer",
    animationDuration: "2s",
    animationDelay: "2.5s",
    animationFillMode: "forwards",
    animationTimingFunction: "ease-out",
    "& .text": {
      position: "absolute",
      top: "20px",
      left: "-340px",
      fontFamily: "cursive",
      fontSize: "34px",
      animationName: "animationText",
      animationDuration: "0.5s",
      animationDelay: "3.5s",
      animationFillMode: "forwards",
      animationTimingFunction: "ease-out"
    },
    "& .text2": {
      position: "absolute",
      bottom: "20px",
      right: "-520px",
      fontFamily: "cursive",
      fontSize: "34px",
      animationName: "animationText2",
      animationDuration: "0.5s",
      animationDelay: "7s",
      animationFillMode: "forwards",
      animationTimingFunction: "ease-out"
    },
    "& .letter": {
      fontFamily: "cursive",
      fontSize: "120px",
      animationFillMode: "forwards",
      animationTimingFunction: "ease-out"
    },
    "& .m": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "334px",
      color: "#ff2400",
      animationName: "animationM",
      animationDuration: "0.5s",
      animationDelay: "4s"
    },
    "& .i": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "453px",
      color: "#e8b71d",
      animationName: "animationI",
      animationDuration: "0.5s",
      animationDelay: "4.5s"
    },
    "& .l": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "489px",
      color: "#e3e81d",
      animationName: "animationL",
      animationDuration: "0.5s",
      animationDelay: "5s"
    },
    "& .i2": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "520px",
      color: "#1ddde8",
      animationName: "animationI2",
      animationDuration: "0.5s",
      animationDelay: "5.5s"
    },
    "& .c": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "556px",
      color: "#1de840",
      animationName: "animationC",
      animationDuration: "0.5s",
      animationDelay: "6s"
    },
    "& .a": {
      opacity: 0,
      position: "absolute",
      top: "64px",
      left: "602px",
      color: "#dd00f3",
      animationName: "animationA",
      animationDuration: "0.5s",
      animationDelay: "6.5s"
    }
  },
  ["@keyframes animationContainer"]: {
    "0%": {
      height: "0",
      border: "1px solid transparent",
      background: "none"
    },
    "50%": {
      height: "300px",
      border: "1px solid transparent",
      background: "none"
    },
    "100%": {
      height: "300px",
      border: "1px solid var(--ft-color-louder)",
      background: "darkred"
    }
  },
  ["@keyframes animationText"]: {
    "0%": {
      left: "-340px",
    },
    "100%": {
      left: "20px",
    }
  },
  ["@keyframes animationText2"]: {
    "0%": {
      right: "-520px",
    },
    "100%": {
      right: "20px",
    }
  },
  ["@keyframes animationM"]: {
    "0%": {
      opacity: 1,
      color: "#dd00f3",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#ff2400"
    },
    "33%": {
      opacity: 1,
      color: "#1de840"
    },
    "50%": {
      opacity: 1,
      color: "#1ddde8"
    },
    "67%": {
      opacity: 1,
      color: "#e3e81d"
    },
    "83%": {
      opacity: 1,
      color: "#e8b71d"
    },
    "100%": {
      opacity: 1,
      color: "#ff2400"
    }
  },
  ["@keyframes animationI"]: {
    "0%": {
      opacity: 1,
      color: "#ff2400",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#dd00f3"
    },
    "33%": {
      opacity: 1,
      color: "#ff2400"
    },
    "50%": {
      opacity: 1,
      color: "#1de840"
    },
    "67%": {
      opacity: 1,
      color: "#1ddde8"
    },
    "83%": {
      opacity: 1,
      color: "#e3e81d"
    },
    "100%": {
      opacity: 1,
      color: "#e8b71d"
    }
  },
  ["@keyframes animationL"]: {
    "0%": {
      opacity: 1,
      color: "#e8b71d",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#ff2400"
    },
    "33%": {
      opacity: 1,
      color: "#dd00f3"
    },
    "50%": {
      opacity: 1,
      color: "#ff2400"
    },
    "67%": {
      opacity: 1,
      color: "#1de840"
    },
    "83%": {
      opacity: 1,
      color: "#1ddde8"
    },
    "100%": {
      opacity: 1,
      color: "#e3e81d"
    }
  },
  ["@keyframes animationI2"]: {
    "0%": {
      opacity: 1,
      color: "#e3e81d",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#e8b71d"
    },
    "33%": {
      opacity: 1,
      color: "#ff2400"
    },
    "50%": {
      opacity: 1,
      color: "#dd00f3"
    },
    "67%": {
      opacity: 1,
      color: "#ff2400"
    },
    "83%": {
      opacity: 1,
      color: "#1de840"
    },
    "100%": {
      opacity: 1,
      color: "#1ddde8"
    }
  },
  ["@keyframes animationC"]: {
    "0%": {
      opacity: 1,
      color: "#1ddde8",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#e3e81d"
    },
    "33%": {
      opacity: 1,
      color: "#e8b71d"
    },
    "50%": {
      opacity: 1,
      color: "#ff2400"
    },
    "67%": {
      opacity: 1,
      color: "#dd00f3"
    },
    "83%": {
      opacity: 1,
      color: "#ff2400"
    },
    "100%": {
      opacity: 1,
      color: "#1de840"
    }
  },
  ["@keyframes animationA"]: {
    "0%": {
      opacity: 1,
      color: "#ff2400",
      fontSize: "4000px",
      transform: "translate(-2300px, -2200px)"
    },
    "17%": {
      opacity: 1,
      color: "#1de840"
    },
    "33%": {
      opacity: 1,
      color: "#1ddde8"
    },
    "50%": {
      opacity: 1,
      color: "#e3e81d"
    },
    "67%": {
      opacity: 1,
      color: "#e8b71d"
    },
    "83%": {
      opacity: 1,
      color: "#ff2400"
    },
    "100%": {
      opacity: 1,
      color: "#dd00f3"
    }
  }
};

@injectStyles(styles)
@observer
export default class Milica extends React.Component{
  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className="text">Thank you and goodbye</div>
        <div className="letter m">M</div>
        <div className="letter i">i</div>
        <div className="letter l">l</div>
        <div className="letter i2">i</div>
        <div className="letter c">c</div>
        <div className="letter a">a</div>
        <div className="text2">all the best for your future endeavors</div>
      </div>
    );
  }
}