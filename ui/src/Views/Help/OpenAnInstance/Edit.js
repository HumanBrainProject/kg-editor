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
        <h1>Edit an instance</h1>
        <p>The edit mode of an opened instance has the same navigation than the view mode, please refer to the “View” section if you haven’t yet. On top of that, you are able to edit the values of the instances, and create link between instances and even create new instances directly from here.</p>

        <h2>Edit a text value</h2>
        <p>You can edit text values by simply using the standards input boxes.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/text-values.png`}/>
        </p>

        <h2>Edit a link value</h2>
        <p>If an instance value is a link, the input box will offer you the possibility to link an instance, from the dropdown of existing instances. You can use the input area to search among those results.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/linked-values.png`}/>
        </p>

        <p>You can also remove a value by clicking on the cross near an already selected value.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/remove-value.png`}/>
        </p>

        <p>If you have to create a new instance you can do it as well, by entering the name in the input area and use the “Add a value” option in the dropdown list. KG Editor will then create a new graph instance, link it and let you complete the informations of this new instance.</p>
        <p>
          <img className={"screenshot"} src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/add-value.png`}/>
        </p>

        <h2>Saving the changes</h2>
        <p>Once an instance has been modified in any way, it will be listed in the “Unsaved instances” panel. Please see the “Save section” to get more information on that subject.</p>
      </div>
    );
  }
}

export default HelpView;