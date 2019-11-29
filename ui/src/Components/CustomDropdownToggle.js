import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  dropdownLink: {
    color: "var(--ft-color-normal)",
    fontSize: "0.9em",
    textDecoration: "none",
    "&:hover": {
      color: "var(--ft-color-loud)",
      textDecoration: "none"
    }
  }
};

@injectStyles(styles)
@observer
class CustomDropdownToggle extends React.Component {
  handleClick = e => {
    e.preventDefault();
    this.props.onClick(e);
  }

  render() {
    const { classes } = this.props;
    return (
      <a onClick={this.handleClick} className={classes.dropdownLink}>
        {this.props.children} <FontAwesomeIcon icon={"caret-down"} />
      </a>
    );
  }
}

export default CustomDropdownToggle;