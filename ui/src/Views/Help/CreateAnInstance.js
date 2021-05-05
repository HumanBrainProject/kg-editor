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

const styles = {
  container:{

  }
};

@injectStyles(styles)
export default class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Create an instance</h1>
        <p>You have three different ways of creating a new instance.</p>

        <h2>From the main application navigation</h2>
        <p>From the dashboard, you can use the “New instance” quick access to create a new instance. Choose the type of instance you want to create in the window shown after clicking on this button.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/CreateAnInstance/new-instance-button.png`}/>
        </p>

        <h2>From the “Browse” screen</h2>
        <p>In the browse/search feature, you can create a new instance by hovering a node type on the left panel and clicking on the corresponding “Plus” button.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/CreateAnInstance/create-instance.png`}/>
        </p>

        <h2>From the instance edit mode</h2>
        <p>Please see the “Edit” section to know more about creating instances from this mode.</p>
      </div>
    );
  }
}