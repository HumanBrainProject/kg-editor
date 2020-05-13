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
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../Stores/AppStore";
import MultiToggle from "../../Components/MultiToggle";

const styles = {
  container:{
    textAlign:"center"/*,
    marginBottom:"10px"*/
  },
  icon:{
    color:"var(--ft-color-normal)",
    fontSize:"3em",
    marginBottom:"3px"//"10px"
  }
};

@injectStyles(styles)
@observer
export default class ThemeSwitcher extends React.Component{
  handleChange = (theme) => {
    appStore.setTheme(theme);
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.icon}>
          <FontAwesomeIcon icon={appStore.currentTheme === "bright"? "sun": "moon"}/>
        </div>
        <div className={classes.switcher}>
          <MultiToggle selectedValue={appStore.currentTheme} onChange={this.handleChange}>
            <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"moon"} value="default"/>
            <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"sun"} value="bright"/>
          </MultiToggle>
        </div>
      </div>
    );
  }
}