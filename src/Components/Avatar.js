import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  avatar: {
    verticalAlign: "middle",
    "&.picture": {
      border: 0,
      borderRadius: "50%"
    },
    "&.devault": {
      transform: "scale(1.35)"
    }
  }
};

@injectStyles(styles)
export default class Avatar extends React.Component {

  render() {
    const {classes, userId, name, picture} = this.props;

    if (!userId) {
      return null;
    }

    if (picture) {
      return (
        <img alt={name?name:userId} width="20" height="20" src={picture} title={name?name:userId} className={`${classes.avatar} avatar picture`} />
      );
    }

    return (
      <FontAwesomeIcon icon="user" title={name?name:userId} className={`${classes.avatar} avatar default`} />
    );
  }
}