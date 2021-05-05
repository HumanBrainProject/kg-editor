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
        <h1>Explore the graph from an instance</h1>
        <p>The “Explore” view of an opened instance allows you to visualise in a graphical way all the instances linked to the opened instance. For the moment, the view shows 2 levels of depth of outgoing links, and 1 level below of incoming links to the opened instance.</p>

        <h2>Visualise</h2>
        <p>The view is made out of two panels. The left one offers the actual visualisation, and the right one shows the list of all the node types that you can currently see, that you can expand to see a list of all the instances of a type.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Explore/explore.png`}/>
        </p>

        <p>By default, all the instances of a same node type are regrouped, for ease of readability. You can visually differentiate different types of nodes. Circles are individual instances, squares are groups of instances of the same node type, and the big circle with a dashed border is the current opened instance. </p>
        <p>Clicking on a group (square) node will ungroup it, and thus show all the individual instances of this group. </p>
        <p>Clicking on an individual instance node, or its corresponding item in the lists on the right panel, will open this instance in a new tab, in “Explore” mode.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Explore/navigate.png`}/>
        </p>

        <p>You can hover a node to highlight it and its direct links and linked nodes. You can differentiate two types of links, outgoing (green) and incoming (orange), with the arrows indicating the direction as well.</p>
        <h2>Configure</h2>

        <p>You can use the right panel toggles to group, ungroup or hide a node type. </p>
        <p>On the left panel, you can drag around all the nodes, and zoom in/out, to adjust the view to your needs.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Explore/configure.png`}/>
        </p>

        <h2>Capture</h2>
        <p>The capture button will export and download the current view.</p>

        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Explore/capture.png`}/>
        </p>
      </div>
    );
  }
}