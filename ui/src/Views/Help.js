/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Scrollbars } from "react-custom-scrollbars";

import Introduction from "./Help/Introduction";

import Browse from "./Help/Browse";
import BrowseNodetypes from "./Help/Browse/Nodetypes";

import CreateAnInstance from "./Help/CreateAnInstance";

import OpenAnInstance from "./Help/OpenAnInstance";
import OAIView from "./Help/OpenAnInstance/View";
import OAIEdit from "./Help/OpenAnInstance/Edit";
import OAIEditSave from "./Help/OpenAnInstance/Edit/Save";
import OAIExplore from "./Help/OpenAnInstance/Explore";
import OAIRelease from "./Help/OpenAnInstance/Release";

import Statistics from "./Help/Statistics";

import Settings from "./Help/Settings";

import FAQ from "./Help/FAQ";

import ContactTheSupport from "./Help/ContactTheSupport";

const useStyles = createUseStyles({
  container:{
    display:"grid",
    height:"100%",
    padding:"10px",
    gridTemplateColumns:"320px 1fr",
    gridTemplateRows:"1fr",
    gridGap:"10px"
  },
  navigation:{
    background:"var(--bg-color-ui-contrast2)",
    padding:"10px",
    border:"1px solid var(--border-color-ui-contrast1)",
    "& ul":{
      listStyle:"none",
      padding:0,
      "& li":{
        margin:"10px 0 10px 20px",
        "& a":{
          fontSize:"1.2em",
          color:"var(--ft-color-normal)",
          "&.active":{
            color:"var(--ft-color-louder)"
          },
          "& .svg-inline--fa":{
            marginRight:"10px"
          }
        }
      }
    }
  },
  content:{
    background:"var(--bg-color-ui-contrast2)",
    border:"1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-loud)",
    fontSize:"1.05em",
  },
  contentInner:{
    padding:"10px 20px",
    "& img.screenshot":{
      border:"5px solid #ccc",
      display:"block",
      borderRadius:"4px",
      margin:"20px 0",
      maxWidth:"800px"
    },
    "& p":{
      margin:"10px 0"
    }
  }
});

const Instances = ({match}) => {
  const classes = useStyles();
  const {path} = match;
  return (
    <div className={classes.container}>
      <div className={classes.navigation}>
        <ul>
          <li><NavLink to={`${path}/introduction`}><FontAwesomeIcon fixedWidth icon="question-circle"/>Introduction</NavLink></li>
          <li>
            <NavLink to={`${path}/browse`}><FontAwesomeIcon fixedWidth icon="search"/>Browse the Knowledge Graph</NavLink>
            <ul>
              <li><NavLink to={`${path}/browse/nodetypes`}><FontAwesomeIcon fixedWidth icon="code-branch" transform={"flip-h rotate--90"}/>Nodetypes</NavLink></li>
            </ul>
          </li>
          <li><NavLink to={`${path}/create`}><FontAwesomeIcon fixedWidth icon="plus"/>Create an instance</NavLink></li>
          <li>
            <NavLink to={`${path}/instance`}><FontAwesomeIcon fixedWidth icon="circle"/>Open an instance</NavLink>
            <ul>
              <li><NavLink to={`${path}/instance/view`}><FontAwesomeIcon fixedWidth icon="eye"/>View</NavLink></li>
              <li>
                <NavLink to={`${path}/instance/edit`}><FontAwesomeIcon fixedWidth icon="pencil-alt"/>Edit</NavLink>
                <ul>
                  <li><NavLink to={`${path}/instance/edit/save`}><FontAwesomeIcon fixedWidth icon="save"/>Save</NavLink></li>
                </ul>
              </li>
              <li><NavLink to={`${path}/instance/graph`}><FontAwesomeIcon fixedWidth icon="project-diagram"/>Explore</NavLink></li>
              <li><NavLink to={`${path}/instance/release`}><FontAwesomeIcon fixedWidth icon="cloud-upload-alt"/>Release</NavLink></li>
            </ul>
          </li>
          {/*<li><NavLink to={`${path}/statistics`}><FontAwesomeIcon fixedWidth icon="chart-bar"/>Statistics</NavLink></li>*/}
          {/*<li><NavLink to={`${path}/settings`}><FontAwesomeIcon fixedWidth icon="cog"/>Settings</NavLink></li>*/}
          <li><NavLink to={`${path}/faq`}><FontAwesomeIcon fixedWidth icon="question-circle"/>F.A.Q</NavLink></li>
          <li><NavLink to={`${path}/contact`}><FontAwesomeIcon fixedWidth icon="envelope"/>Contact the support</NavLink></li>
        </ul>
      </div>
      <div className={classes.content}>
        <Scrollbars autoHide>
          <div className={classes.contentInner}>
            <Switch>
              <Route exact path={`${path}`} render={()=><Redirect to={`${path}/introduction`}/>}/>
              <Route path={`${path}/introduction`} exact={true} component={Introduction}/>

              <Route path={`${path}/browse`} exact={true} component={Browse}/>
              <Route path={`${path}/browse/nodetypes`} exact={true} component={BrowseNodetypes}/>

              <Route path={`${path}/create`} exact={true} component={CreateAnInstance}/>

              <Route path={`${path}/instance`} exact={true} component={OpenAnInstance}/>
              <Route path={`${path}/instance/view`} exact={true} component={OAIView}/>
              <Route path={`${path}/instance/edit`} exact={true} component={OAIEdit}/>
              <Route path={`${path}/instance/edit/save`} exact={true} component={OAIEditSave}/>
              <Route path={`${path}/instance/graph`} exact={true} component={OAIExplore}/>
              <Route path={`${path}/instance/release`} exact={true} component={OAIRelease}/>

              <Route path={`${path}/statistics`} exact={true} component={Statistics}/>
              <Route path={`${path}/settings`} exact={true} component={Settings}/>
              <Route path={`${path}/faq`} exact={true} component={FAQ}/>
              <Route path={`${path}/contact`} exact={true} component={ContactTheSupport}/>

            </Switch>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default Instances;