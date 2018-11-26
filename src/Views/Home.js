import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

import Hub from "./Home/Hub";
import Instances from "./Home/Instances";
import TipsOfTheDay from "./Home/TipsOfTheDay";
import KeyboardShortcuts from "./Home/KeyboardShortcuts";
import Features from "./Home/Features";
import NodeTypesBarChart from "./Home/NodeTypesBarChart";
import UsersPieChart from "./Home/UsersPieChart";
import authStore from "../Stores/AuthStore";
import instanceStore from "../Stores/InstanceStore";
import bookmarkStatusStore from "../Stores/BookmarkStatusStore";

const rootPath = window.rootPath || "";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    color: "var(--ft-color-normal)"
  },
  panel: {
    display: "grid",
    width: "100%",
    height: "100%",
    padding: "10px",
    gridGap: "10px",
    gridTemplateColumns: "calc(80% - 10px) 20%",
    gridTemplateRows: "auto auto",
    gridTemplateAreas: `"welcome nav"
                        "main features"`
  },
  welcome: {
    gridArea: "welcome",
    position: "relative",
    height: "125px",
    "@media screen and (min-height:1200px)": {
      height: "220px"
    },
    "& h1": {
      position: "absolute",
      bottom: "0",
      margin: "0",
      fontSize: "6em"
    }
  },
  nav: {
    gridArea: "nav"
  },
  main: {
    gridArea: "main",
    position: "relative",
    "& > * + *": {
      marginTop: "10px",
    },
    "& .widget-list": {
      "& > * + *": {
        margin: "10px 0 0 0"
      },
      "@media screen and (min-width:1600px)": {
        display: "flex",
        "& > * + *": {
          margin: "0 0 0 10px"
        }
      }
    }
  },
  features: {
    gridArea: "features",
    position: "relative",
    "& .widget-list": {
      "& > * + *": {
        margin: "10px 0 0 0"
      }
    }
  },
  cat:{
    display: "none",
    "@media screen and (min-width:1200px)": {
      display: "block",
      position: "absolute",
      bottom: "-145px",
      left: "-480px",
      transform: "scale(0.3)",
      animation: "walk 180s linear infinite",
      zIndex: 10000
    },
  },
  "@keyframes walk": {
    "0%":{
      top: "-100px",
      left: "-480px",
      transform: "scale(0.3)"
    },
    "5%":{
      top: "-100px",
      left: "-480px",
      transform: "scale(0.3)"
    },
    "45%":{
      top: "-100px",
      left: "calc(100% + 480px)",
      transform: "scale(0.3)"
    },
    "50%":{
      top: "-100px",
      left: "calc(100% + 480px)",
      transform: "scale(0.3)"
    },
    "51%":{
      top: "unset",
      left: "calc(100% + 480px)",
      transform: "scale(0.3) rotateY(180deg)"
    },
    "55%":{
      top: "unset",
      left: "calc(100% + 480px)",
      transform: "scale(0.3) rotateY(180deg)"
    },
    "95%":{
      top: "unset",
      left: "-480px",
      transform: "scale(0.3) rotateY(180deg)"
    },
    "100%":{
      top: "unset",
      left: "-480px",
      transform: "scale(0.3) rotateY(180deg)"
    }
  }
};

@injectStyles(styles)
@observer
export default class Home extends React.Component{
  render(){
    const { classes } =  this.props;
    const lastEditedInstances = instanceStore.getLastEditedInstances(10, "dataset");
    const lastViewedInstances = instanceStore.getLastViewedInstances(10, "dataset");
    const lastBookmarkedInstances = bookmarkStatusStore.getLastBookmarkedInstances(10, "dataset");
    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          <div className={classes.panel}>
            <div className={classes.welcome}>
              <h1>Welcome <span title={authStore.user.name}>{authStore.user.name.split(" ")[0]}</span></h1>
            </div>
            <div className={classes.nav}>
              <Hub/>
            </div>
            <div className={classes.main}>
              <div className="widget-list">
                <NodeTypesBarChart />
                <UsersPieChart />
              </div>
              {lastEditedInstances && !!lastEditedInstances.length && (
                <Instances title="Your last edited instances" list={lastEditedInstances} />
              )}
              {lastViewedInstances && !!lastViewedInstances.length && (
                <Instances title="Your last viewed instances" list={lastViewedInstances} />
              )}
              {lastBookmarkedInstances && !!lastBookmarkedInstances.length && (
                <Instances title="Your last bookmarked instances" list={lastBookmarkedInstances} />
              )}
            </div>
            <div className={classes.features}>
              <div className="widget-list">
                <KeyboardShortcuts />
                <Features />
              </div>
            </div>
          </div>
          <TipsOfTheDay />
        </Scrollbars>
        <img className={classes.cat} src={`${window.location.protocol}//${window.location.host}${rootPath}/assets/cat.gif`} />
      </div>
    );
  }
}
