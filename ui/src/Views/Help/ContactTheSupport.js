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
export default class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Contact us</h1>
        <p>Should you encounter any problem with this application, please contact our team by email at : <a href={"mailto:kg-team@humanbrainproject.eu"}>kg-team@humanbrainproject.eu</a></p>
      </div>
    );
  }
}