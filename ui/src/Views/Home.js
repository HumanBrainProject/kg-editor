import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

import Hub from "./Home/Hub";
import InstancesHistory from "./Home/InstancesHistory";
import TipsOfTheDay from "./Home/TipsOfTheDay";
import KeyboardShortcuts from "./Home/KeyboardShortcuts";
import Features from "./Home/Features";
// import DatasetsStatistics from "./Home/DatasetsStatistics";
import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";

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
      bottom: "10px",
      margin: "0",
      fontSize: "4.5em"
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
  },
  workspacesSelection: {
    fontSize: "1.5em",
    padding: "0 0 30px 0",
    "& h1": {
      padding: "0 30px 20px 30px"
    },
    "& p": {
      padding: "0 30px",
      fontWeight: "300"
    }
  },
  workspaces: {
    display: "grid",
    padding: "0 30px",
    gridGap: "15px",
    gridTemplateColumns: "repeat(1fr)",
    "@media screen and (min-width:768px)": {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    "@media screen and (min-width:1024px)": {
      gridTemplateColumns: "repeat(3, 1fr)"
    },
  },
  workspace: {
    position: "relative",
    padding: "20px",
    fontWeight: "300",
    textAlign: "center",
    border: "1px solid #ccc",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "1.2em",
    wordBreak: "break-word",
    "@media screen and (min-width:768px)": {
      whiteSpace: "nowrap"
    },
    "&:hover": {
      background: "#f3f3f3"
    }
  },
  workspaceSelectionModal: {
    overflow: "hidden",
    width: "90%",
    margin: "auto",
    "@media screen and (min-width:1024px)": {
      width: "900px"
    },
    "&.modal-dialog": {
      marginTop: "25vh",
      "& .modal-body": {
        padding: "0",
        maxHeight: "calc(100vh - 30vh -80px)",
        overflowY: "hidden"
      }
    }
  },
  noWorkspacesModal: {
    "&.modal-dialog": {
      marginTop: "40vh",
      "& .modal-body": {
        padding: "0 30px 15px 30px",
        fontSize: "1.6rem",
        "@media screen and (min-width:768px)": {
          whiteSpace: "nowrap"
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
class Home extends React.Component{

  render(){
    const { classes } =  this.props;
    const firstNameReg = /^([^ ]+) .*$/;
    const name = authStore.hasUserProfile
      && authStore.user
      && authStore.user.givenName?
      authStore.user.givenName
      :
      authStore.user.displayName?
        (firstNameReg.test(authStore.user.displayName)?
          authStore.user.displayName.match(firstNameReg)[1]
          :
          authStore.user.displayName)
        :
        authStore.user.username?
          authStore.user.username
          :
          "";
    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          <div className={classes.panel}>
            <div className={classes.welcome}>
              <h1>Welcome <span title={name}>{name}</span></h1>
            </div>
            <div className={classes.nav}>
              <Hub/>
            </div>
            <div className={classes.main}>
              {/* <DatasetsStatistics /> */}
              <InstancesHistory workspace={appStore.currentWorkspace}/>
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


export default Home;