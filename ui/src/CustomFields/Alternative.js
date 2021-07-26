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
import { MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import authStore from "../Stores/AuthStore";
import UserByID from "../Views/UserByID";

const Value = ({value, field}) => {

  if (value === undefined || value === null) {
    return null;
  }

  const labelAttributeName = (field && field.mappingLabel)?field.mappingLabel:"name";
  const valueAttributeName = (field && field.mappingValue)?field.mappingValue:"id";

  if (typeof value === "object") {
    return value[labelAttributeName]?value[labelAttributeName]:(value[valueAttributeName]?value[valueAttributeName]:null);
  }

  return value;
};

const Values = ({value, field, separator= "; "}) => {

  if (typeof value === "object" && value.length) {

    const valueAttributeName = (field && field.mappingValue)?field.mappingValue:"id";

    return value.map((item, index) => {
      return(
        <React.Fragment key={typeof item === "object"?(item[valueAttributeName]?item[valueAttributeName]:index):item}>
          {index?separator:""}<Value value={item} field={field} />
        </React.Fragment>
      );
    });
  }

  return (
    <Value value={value} />
  );
};

const styles = {
  container: {
    "& .option em .user + .user:before": {
      content: "'; '"
    },
    "& .option": {
      position: "relative",
      paddingLeft: "3px",
    },
    "& .option .parenthesis": {
      display: "inline-block",
      transform: "scaleY(1.4)"
    },
    "& .selected": {
      position: "absolute",
      top: "50%",
      left: "-15px",
      transform: "translateY(-50%)"
    }
  },
  removeIcon: {
    marginLeft: "1%"
  }
};

@injectStyles(styles)
export default class Alternative extends React.Component {

  handleSelect = alternative => event => {
    const { onSelect } = this.props;
    typeof onSelect === "function" && onSelect(alternative, event);
  }

  handleClick = event => {
    event.stopPropagation();
    const { onClick } = this.props;
    typeof onClick === "function" && onClick(event);
  }

  render() {
    const { classes, alternative, field, className } = this.props;

    const userIds = (!alternative || !alternative.userIds)?[]:(typeof alternative.userIds === "string")?[alternative.userIds]:alternative.userIds;
    const isOwnAlternative = userIds.includes(authStore.user.username);

    return (
      <MenuItem className={`quickfire-dropdown-item ${classes.container}`} onSelect={this.handleSelect(alternative)}>
        <div tabIndex={-1} className={`option ${className?className:""}`} onKeyDown={this.handleSelect(alternative)}>
          <strong>
            <Values value={alternative.value} field={field} /></strong> <em><div className="parenthesis">(</div>{
            userIds.map(userId => (
              <UserByID key={userId} userId={userId} />
            ))
          }<div className="parenthesis">)</div></em>
          {alternative.selected?
            <FontAwesomeIcon icon="check" className="selected" />
            :null
          }
          {isOwnAlternative && (
            <span className={classes.removeIcon}><FontAwesomeIcon onClick={this.handleClick} icon="times" /></span>
          )}
        </div>
      </MenuItem>
    );
  }
}