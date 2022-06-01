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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";

import { useStores } from "../../../Hooks/UseStores";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  btn: {
    padding: ".175rem .75rem",
    marginRight: "5px",
    marginTop: "5px",
    color: "#212529",
    "&:hover": {
      backgroundColor: "transparent",
      borderColor: "var(--link-border-color-hover)",
      color: "#212529"
    }
  }
});

const PossibleIncomingLink = observer(({ type, spaces }) => {

  const classes = useStyles();
  const { appStore, browseStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkFrom = space => {
    if(appStore.currentSpace.id !== space) {
      const changeSpace = appStore.switchSpace(location, navigate, space);
      if(!changeSpace) {
        return;
      }
    }
    navigate("/browse");
    browseStore.selectItem(type);
  };

  return(
    <>
      {spaces.map(space => (
        <Button key={`${space}-${type.label}`} className={classes.btn}  onClick={() => handleLinkFrom(space)} variant="outline-secondary">
          <FontAwesomeIcon icon={"circle"} color={type.color}/>&nbsp;&nbsp;<span>{type.label} <strong title="space"><i>({space})</i></strong></span>
        </Button>
      ))}
    </>
  );
});
PossibleIncomingLink.displayName = "PossibleIncomingLink";

export default PossibleIncomingLink;