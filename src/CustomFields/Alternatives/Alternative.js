import React from "react";
import injectStyles from "react-jss";
import { MenuItem } from "react-bootstrap";

import User from "./User";

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
    const { classes, alternative } = this.props;

    return (
      <MenuItem className={`quickfire-dropdown-item ${classes.container}`} onSelect={this.handleSelect.bind(this, alternative)}>
        <div tabIndex={-1} className="option" onKeyDown={this.handleSelect.bind(this, alternative)}>
          <strong>{alternative.value}</strong> <em><div className="parenthesis">(</div>{
            alternative.users.map(userId => (
              <User key={userId} userId={userId} />
            ))
          }<div className="parenthesis">)</div></em>
        </div>
      </MenuItem>
    );
  }
}