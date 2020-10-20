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
import { createUseStyles } from "react-jss";

import Avatar from "./Avatar";

const useStyles = createUseStyles({
  user: {
    "& .avatar.default": {
      margin: "0 5px"
    },
    "& .avatar.picture": {
      margin: "0 2px 0 5px"
    },
    "& .name:not(.is-curator)":  {
      color: "#337ab7"
    }
  }
});

const User = ({userId, name, picture, isCurator, title})  => {
  if (!userId) {
    return null;
  }

  const classes = useStyles();
  return (
    <span className={`${classes.user} user`}><Avatar userId={userId} name={name} picture={picture} />{title?
      <span className={`name ${isCurator?"is-curator":""} `} title={title}>{name?name:userId}</span>
      :
      <span className={`name" ${isCurator?"is-curator":""} `} >{name?name:userId}</span>
    }</span>
  );
};

export default User;