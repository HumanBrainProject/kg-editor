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
import { observer } from "mobx-react";
import { createUseStyles } from "react-jss";
import MenuItem from "react-bootstrap/MenuItem";

import UserComponent from "../../../Components/User";

const useStyles = createUseStyles({
  container: {
    width: "100%",
    padding: "6px 5px",
    "& > a": {
      padding: "0 !important",
      color: "#333",
      textDecoration: "none",
      outline: 0,
      "& .option": {
        "& .user": {
          display: "flex",
          alignItems: "center",
          "& .avatar": {
            margin: "0 5px",
            "&.default": {
              margin: "0 9px",
            }
          }
        }
      },
      "&:hover, &:active, &:focus, &:visited": {
        textDecoration: "none",
        outline: 0
      },
      "&:visited": {
        color: "#333",
      },
      "&:hover, &:active, &:focus": {
        color: "black"
      }
    },
    "&:hover": {
      background: "#f5f5f5",
      color: "black",
      "& .user .name:not(.is-curator)": {
        color: "#1c4263"
      }
    }
  },
  reviewStatus: {
    padding: "6px 0",
    verticalAlign: "middle"
  }
});

const User = observer(({ user, onSelect }) => {

  const classes = useStyles();

  const handleSelect = e => {
    typeof onSelect === "function" && onSelect(user, e);
  };

  const email = (user && user.emails instanceof Array)?user.emails.reduce((email, item) => {
    if (item && item.value && item.verified) {
      if (item.primary || !email) {
        return item;
      }
    }
    return email;
  }, null):null;

  return (
    <MenuItem  key={user.id} className={`quickfire-dropdown-item ${classes.container}`} onSelect={handleSelect}>
      <div tabIndex={-1} className="option" onKeyDown={handleSelect}>
        <UserComponent
          userId={user && user.id}
          name={user && user.name}
          picture={user && user.picture}
          isCurator={!!user && !!user.isCurator}
          title={email} />
      </div>
    </MenuItem>
  );
});

export default User;