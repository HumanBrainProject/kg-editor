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

const styles = {
  container:{

  }
};

@injectStyles(styles)
class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Open an instance</h1>
        <p>In the KG Editor, you can open one or multiple instances that you want to view or edit. Each opened instance will show a new tab at the top of the application.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/tabs.png`}/>
        </p>

        <h2>Opening modes</h2>
        <p>From the “Browse” feature, you can chose to open an instance in different modes.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/browse-modes.png`}/>
        </p>

        <p>Once an instance is opened, you can switch between the different modes using the left tool bar.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/modes.png`}/>
        </p>

        <h3>View mode</h3>
        <p>Use it to view an instance and its associated instances and data. See the “View” section to get more information about that mode.</p>

        <h3>Edit mode</h3>
        <p>Edit mode is basically the same navigation as in view mode, with the possibility to edit an instance and its associated instances. See the “Edit” section to get more information about that mode.</p>

        <h3>Explore mode</h3>
        <p>This mode offers a graphical representation of the opened instance. You can see all the instances linked to the open instance and open them in a new tab. See the “Explore” section to get more information about that mode.</p>

        <h3>Release mode</h3>
        <p>In release mode, you can see and modify the release state of the opened instance and its tree of linked instances. See the “Release” section to get more information about that mode.</p>
      </div>
    );
  }
}

export default HelpView;