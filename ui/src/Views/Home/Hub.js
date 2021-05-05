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
import {observer} from "mobx-react";

import browseStore from "../../Stores/BrowseStore";
import instanceStore from "../../Stores/InstanceStore";
import ThemeSwitcher from "./ThemeSwitcher";

const styles = {
  container:{
    display: "flex",
    position: "relative",
    height: "100%"
  },
  action:{
    alignSelf: "flex-end",
    textAlign:"center",
    padding:"10px",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child": {
      flex: 1
    },
    "&.statistics": {
      paddingBottom: "13px",
      "& $actionIcon": {
        transform: "scale(1.35) translateY(-4px)"
      }
    }
  },
  actionIcon:{
    fontSize:"3em"
  },
  actionText:{
    fontSize:"0.9em",
    textTransform:"uppercase",
    fontWeight:"bold"
  }
};

@injectStyles(styles)
@observer
export default class Hub extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showCreateModal:false
    };
  }

  handleCreateInstance = () => {
    if(!browseStore.isFetched.lists && !browseStore.isFetching.list){
      browseStore.fetchLists();
    }
    instanceStore.toggleShowCreateModal();
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.action}></div>
        {/* <div className={`${classes.action} statistics`} onClick={()=>routerStore.history.push("/kg-stats")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"chart-bar"}/>
          </div>
          <div className={classes.actionText}>
            KG Statistics
          </div>
        </div> */}
        <div className={classes.action}>
          <ThemeSwitcher/>
        </div>
      </div>
    );
  }
}