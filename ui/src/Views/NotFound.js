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
import { Link } from "react-router-dom";

const styles = {
  container: {
    width: "80%",
    margin: "20% 10% 80% 10%",
    padding: "20px",
    borderRadius: "5px",
    backgroundColor: "white",
    color: "#444",
    textAlign: "center",
    "@media screen and (min-width:992px)": {
      width: "auto",
      margin: "0",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    },
    "& h3": {
      marginTop: "0",
      fontSize: "18px",
      "@media screen and (min-width:992px)": {
        fontSize: "24px"
      }
    },
    "& p": {
      margin: "20px 0"
    }
  }
};

@injectStyles(styles)
export default class NotFound extends React.Component{
  render(){
    const {classes} =  this.props;
    return (
      <div className={classes.container}>
        <h3>Page not found</h3>
        <div>
          <Link className="btn btn-default" to={"/"}>Go back to the dashboard</Link>
        </div>
      </div>
    );
  }
}
