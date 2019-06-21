import React from "react";
import injectStyles from "react-jss";
import { MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import User from "../Views/User";
import authStore from "../Stores/AuthStore";

const Value = ({value, field}) => {

  if (value === undefined || value === null) {
    return null;
  }

  const labelAttributeName = (field && field.mappingLabel)?field.mappingLabel:"name";
  const valueAttributeName = (field && field.mappingValue)?field.mappingValue:"id";

  if (typeof value === "object") {
    return (
      value[labelAttributeName] ?
        value[labelAttributeName] :
        (value[valueAttributeName] ?
          (valueAttributeName == "id" ?
            <React.Fragment>
              {value[valueAttributeName]}
              <em><span style={{color:"red"}}>(Deleted)</span></em>
            </React.Fragment>:value[valueAttributeName]):null
        )
    );
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
    const isOwnAlternative = userIds.includes(authStore.user.id);

    return (
      <MenuItem className={`quickfire-dropdown-item ${classes.container}`} onSelect={this.handleSelect(alternative)}>
        <div tabIndex={-1} className={`option ${className?className:""}`} onKeyDown={this.handleSelect(alternative)}>
          <strong>
            <Values value={alternative.value} field={field} /></strong> <em><div className="parenthesis">(</div>{
            userIds.map(userId => (
              <User key={userId} userId={userId} />
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