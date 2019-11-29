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
    },
    "& .name:not(.is-curator)":  {
      color: "#337ab7"
    }
  }
};

@injectStyles(styles)
class User extends React.Component {

  render() {
    const {classes, userId, name, picture, isCurator, title} = this.props;

    if (!userId) {
      return null;
    }

    return (
      <span className={`${classes.user} user`}><Avatar userId={userId} name={name} picture={picture} />{title?
        <span className={`name ${isCurator?"is-curator":""} `} title={title}>{name?name:userId}</span>
        :
        <span className={`name" ${isCurator?"is-curator":""} `} >{name?name:userId}</span>
      }</span>
    );
  }
}

export default User;