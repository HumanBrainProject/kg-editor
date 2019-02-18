import React from "react";
import injectStyles from "react-jss";
import { MenuItem } from "react-bootstrap";

import User from "./User";

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
    "& .option .parenthesis": {
      display: "inline-block",
      transform: "scaleY(1.4)"
    }
  }
};

@injectStyles(styles)
export default class Alternative extends React.Component {

  handleSelect = (alternative, event) => {
    const { onSelect } = this.props;
    typeof onSelect === "function" && onSelect(alternative, event);
  }

  render() {
    const { classes, alternative, field, className } = this.props;

    const userIds = (!alternative || !alternative.userIds)?[]:(typeof alternative.userIds === "string")?[alternative.userIds]:alternative.userIds;

    return (
      <MenuItem className={`quickfire-dropdown-item ${classes.container}`} onSelect={this.handleSelect.bind(this, alternative)}>
        <div tabIndex={-1} className={`option ${className?className:""}`} onKeyDown={this.handleSelect.bind(this, alternative)}>
          <strong><Values value={alternative.value} field={field} /></strong> <em><div className="parenthesis">(</div>{
            userIds.map(userId => (
              <User key={userId} userId={userId} />
            ))
          }<div className="parenthesis">)</div></em>
        </div>
      </MenuItem>
    );
  }
}