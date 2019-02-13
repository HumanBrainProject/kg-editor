import React from "react";
import injectStyles from "react-jss";

import Avatar from "./Avatar";

const styles = {
  user: {
    "& .avatar.default": {
      margin: "0 5px"
    },
    "& .avatar.picture": {
      margin: "0 2px 0 5px"
    }
  }
};

@injectStyles(styles)
export default class User extends React.Component {

  render() {
    const {classes, userId, name, picture} = this.props;

    if (!userId) {
      return null;
    }

    return (
      <span className={`${classes.user} user`}><Avatar userId={userId} name={name} picture={picture} />{name?name:userId}</span>
    );
  }
}