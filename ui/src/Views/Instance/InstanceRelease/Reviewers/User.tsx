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

import React, { KeyboardEvent, MouseEvent } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Dropdown from "react-bootstrap/Dropdown";

import UserComponent from "../../../../Components/User";
import { UserSummary } from "../../../../types";

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
              margin: "0 9px"
            }
          }
        }
      },
      "&:hover, &:active, &:focus, &:visited": {
        textDecoration: "none",
        outline: 0
      },
      "&:visited": {
        color: "#333"
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

interface UserProps {
  user: UserSummary;
  onSelect: (user: UserSummary, e: KeyboardEvent<HTMLDivElement> |  MouseEvent<HTMLElement>) => void;
}

const User = observer(({ user, onSelect }: UserProps) => {

  const classes = useStyles();

  if(!user) {
    return null;
  }

  const handleSelect = (e: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLElement>) => onSelect(user, e);

  return (
    <Dropdown.Item className={classes.container} onClick={handleSelect} >
      <div tabIndex={-1} className="option" onKeyDown={handleSelect}>
        <UserComponent userId={user.id} name={user.name} picture={user.picture} />
      </div>
    </Dropdown.Item>
  );
});
User.displayName = "User";

export default User;