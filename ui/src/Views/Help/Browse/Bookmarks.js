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
        <h1>Bookmark lists</h1>
        <p>The KG Editor app lets you create your own bookmark lists of instances to access and monitor easily specific instances.</p>

        <h2>Associate an instance to bookmark lists</h2>
        <p>In the instances list of a given node type, a star icon appears on every item, letting you know if you have this instance bookmarked or not.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/Browse/Bookmarks/bookmark-icon.png`}/>
        </p>


        <p>Clicking on this icon will bring a tooltip with a user input allowing you to add/remove the instance to/from a bookmark list, or create a new list.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/Browse/Bookmarks/manage-bookmarks.png`}/>
        </p>

      </div>
    );
  }
}