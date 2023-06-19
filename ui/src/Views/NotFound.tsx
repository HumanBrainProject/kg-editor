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
import { createUseStyles } from "react-jss";
import { Link, useLocation } from "react-router-dom";

import BGMessage from "../Components/BGMessage";

const useStyles = createUseStyles({
  container: {
    color: "var(--ft-color-loud)"
  }
});

const NotFound = () => {

  const classes = useStyles();

  const location = useLocation();

  return (
    <div className={classes.container} >
      <BGMessage icon={"ban"}>
        The page &quot;<i>{location.pathname}</i>&quot; does not exist.<br /><br />
        <Link className="btn btn-primary" to={"/"}>Go back to the dashboard</Link>
      </BGMessage>
    </div>
  );
};

export default NotFound;
