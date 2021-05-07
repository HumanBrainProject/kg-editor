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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

const useStyles = createUseStyles({
  container: {
    marginLeft: "5px",
    borderRadius: "5px",
    paddingRight: "12px",
    paddingLeft: "12px"
  },
  info: {
    backgroundColor: "rgba(255, 226, 20, 0.6)",
    padding: "5px",
    marginTop: "2px",
    cursor: "pointer"
  },
  create: {
    paddingBottom: "5px"
  }
});

const ExternalTypes = ({types, onExternalCreate}) => (
  <>
    {types.map(type => <ExternalType key={type.name} type={type} onExternalCreate={onExternalCreate}/>)}
  </>
);

const ExternalType = ({ type, onExternalCreate }) => {

  const classes = useStyles();

  return (
    <div className={classes.container}>
      {type.spaces.map(space => (
        <Space key={space.id} space={space} type={type} onExternalCreate={onExternalCreate} />
      ))}
    </div>
  );
};

const Space = ({space, type, onExternalCreate}) => {

  const classes = useStyles();

  const style = type.color ? { color: type.color } : {};

  const handleOnCreate = () => onExternalCreate(space.name, type.name);

  if (space.permissions.canCreate) {
    return (
      <div className={classes.create}>
        <Button variant="primary" size="sm" onClick={handleOnCreate}>
          <em>Create an instance of type <span style={style}>
            <FontAwesomeIcon fixedWidth icon="circle" />
          </span>
          {type.label} in space <strong>{space.name}</strong></em>
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.info}>
      <em>You are not allowed to create an instance of type <span style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      {type.label} in space <strong>{space.name}</strong>. Please contact the support.</em>
    </div>
  );
};

export default ExternalTypes;