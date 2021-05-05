/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

import Hub from "./Home/Hub";
import InstancesHistory from "./Home/InstancesHistory";
import TipsOfTheDay from "./Home/TipsOfTheDay";
import KeyboardShortcuts from "./Home/KeyboardShortcuts";
import Features from "./Home/Features";
import DatasetsStatistics from "./Home/DatasetsStatistics";
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
  }
};

@injectStyles(styles)
@observer
export default class Home extends React.Component{
  render(){
    const { classes } =  this.props;
    const firstname = authStore.hasUserProfile && authStore.user && authStore.user.name?authStore.user.name.split(" ")[0]:"";
    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          <div className={classes.panel}>
            <div className={classes.welcome}>
              <h1>Welcome <span title={authStore.user.name}>{firstname}</span></h1>
            </div>
            <div className={classes.nav}>
              <Hub/>
            </div>
            <div className={classes.main}>
              <DatasetsStatistics />
              <InstancesHistory />
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
