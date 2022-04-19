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

import React, {useEffect} from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPiwik from "react-piwik";
import { Scrollbars } from "react-custom-scrollbars-2";

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

const Instances = () => {
  const classes = useStyles();

  useEffect(() => {
    ReactPiwik.push(["setCustomUrl", window.location.href]);
    ReactPiwik.push(["trackPageView"]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.navigation}>
        <ul>
          <li><NavLink to={"introduction"}><FontAwesomeIcon fixedWidth icon="question-circle"/>Introduction</NavLink></li>
          <li>
            <NavLink to={"browse"}><FontAwesomeIcon fixedWidth icon="search"/>Browse the Knowledge Graph</NavLink>
            <ul>
              <li><NavLink to={"browse/nodetypes"}><FontAwesomeIcon fixedWidth icon="code-branch" transform={"flip-h rotate--90"}/>Nodetypes</NavLink></li>
            </ul>
          </li>
          <li><NavLink to={"create"}><FontAwesomeIcon fixedWidth icon="plus"/>Create an instance</NavLink></li>
          <li>
            <NavLink to={"instance"}><FontAwesomeIcon fixedWidth icon="circle"/>Open an instance</NavLink>
            <ul>
              <li><NavLink to={"instance/view"}><FontAwesomeIcon fixedWidth icon="eye"/>View</NavLink></li>
              <li>
                <NavLink to={"instance/edit"}><FontAwesomeIcon fixedWidth icon="pencil-alt"/>Edit</NavLink>
                <ul>
                  <li><NavLink to={"instance/edit/save"}><FontAwesomeIcon fixedWidth icon="save"/>Save</NavLink></li>
                </ul>
              </li>
              <li><NavLink to={"instance/graph"}><FontAwesomeIcon fixedWidth icon="project-diagram"/>Explore</NavLink></li>
              <li><NavLink to={"instance/release"}><FontAwesomeIcon fixedWidth icon="cloud-upload-alt"/>Release</NavLink></li>
            </ul>
          </li>
          {/*<li><NavLink to={"statistics"}><FontAwesomeIcon fixedWidth icon="chart-bar"/>Statistics</NavLink></li>*/}
          {/*<li><NavLink to={"settings"}><FontAwesomeIcon fixedWidth icon="cog"/>Settings</NavLink></li>*/}
          <li><NavLink to={"faq"}><FontAwesomeIcon fixedWidth icon="question-circle"/>F.A.Q</NavLink></li>
          <li><NavLink to={"contact"}><FontAwesomeIcon fixedWidth icon="envelope"/>Contact the support</NavLink></li>
        </ul>
      </div>
      <div className={classes.content}>
        <Scrollbars autoHide>
          <div className={classes.contentInner}>
            <Routes>
              <Route path={"introduction"} element={<Introduction />}/>
              <Route path={"browse"} element={<Browse />} />
              <Route path={"browse/nodetypes"} element={<BrowseNodetypes />}/>
              <Route path={"create"} element={<CreateAnInstance />}/>
              <Route path={"instance"} element={<OpenAnInstance />}/>
              <Route path={"instance/view"} element={<OAIView />}/>
              <Route path={"instance/edit"} element={<OAIEdit />}/>
              <Route path={"instance/edit/save"} element={<OAIEditSave />}/>
              <Route path={"instance/graph"} element={<OAIExplore />}/>
              <Route path={"instance/release"} element={<OAIRelease />}/>

              <Route path={"statistics"} element={<Statistics />}/>
              <Route path={"settings"} element={<Settings />}/>
              <Route path={"faq"} element={<FAQ />}/>
              <Route path={"contact"} element={<ContactTheSupport />}/>
              <Route path={"*"} render={()=> <Navigate to={"introduction"} replace={true} />}/>
            </Routes>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default Instances;