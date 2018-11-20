import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

import Hub from "./Home/Hub";
import TipsOfTheDay from "./Home/TipsOfTheDay";
import KeyboardShortcuts from "./Home/KeyboardShortcuts";
import Features from "./Home/Features";
import NodeTypesBarChart from "./Home/NodeTypesBarChart";
import UsersPieChart from "./Home/UsersPieChart";
import authStore from "../Stores/AuthStore";

const styles = {
  container: {
    display: "grid",
    height: "100%",
    width: "100%",
    gridGap: "10px",
    gridTemplateColumns: "1fr 7fr 2fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: `"nav welcome features"
                        "nav main features"`,
    padding:"10px",
    "& .widget-panel":{
      width: "100%",
      height: "100%",
      background: "var(--bg-color-ui-contrast2)",
      border: "1px solid var(--border-color-ui-contrast1)",
      color: "var(--ft-color-normal)",
      "& .widget": {
        borderBottom: "1px solid var(--border-color-ui-contrast1)",
        color: "var(--ft-color-normal)",
        "&:last-child": {
          borderBottom: "0"
        }
      },
      "& .widget-row": {
        "& .widget": {
          padding: "10px",
          color: "var(--ft-color-normal)"
        },
        "@media screen and (min-width:1600px)": {
          display: "flex",
          "& .widget": {
            borderBottom: "1px solid var(--border-color-ui-contrast1)",
            borderRight: "1px solid var(--border-color-ui-contrast1)",
            color: "var(--ft-color-normal)",
            "&:last-child": {
              borderBottom: "1px solid var(--border-color-ui-contrast1)",
              borderRight: "0"
            }
          }
        }
      }
    }
  },
  nav: {
    gridArea: "nav",
  },
  welcome: {
    gridArea: "welcome",
    "&.widget-panel": {
      height: "180px",
      position: "relative",
      padding: "10px",
      borderColor: "transparent",
      background: "none",
      backgroundImage: "url('/assets/graph.png')",
      backgroundPosition: "50% 50%",
      "& h1": {
        position: "absolute",
        bottom: "0",
        margin: "0",
        fontSize: "6em"
      }
    }
  },
  main: {
    gridArea: "main"
  },
  features: {
    gridArea: "features"
  }
};

@injectStyles(styles)
@observer
export default class Home extends React.Component{

  render(){
    const { classes } =  this.props;
    return (
      <div className={classes.container}>
        <div className={`${classes.nav} widget-panel`}>
          <Hub/>
        </div>
        <div className={`${classes.welcome} widget-panel`}>
          <h1>Welcome <span title={authStore.user.name}>{authStore.user.name.split(" ")[0]}</span></h1>
        </div>
        <div className={`${classes.main} widget-panel`}>
          <Scrollbars autoHide>
            <div className="widget-row">
              <NodeTypesBarChart />
              <UsersPieChart />
            </div>
          </Scrollbars>
        </div>
        <div className={`${classes.features} widget-panel`}>
          <Scrollbars autoHide>
            <div className="widget">
              <TipsOfTheDay />
              <KeyboardShortcuts />
              <Features />
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  }
}
