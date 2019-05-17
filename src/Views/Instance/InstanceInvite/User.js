import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { MenuItem } from "react-bootstrap";

import UserComponent from "../../../Components/User";

const styles = {
  container: {
    width: "100%",
    padding: "6px 5px",
    "& > a": {
      padding: "0 !important",
      color: "#333",
      textDecoration: "none",
      outline: 0,
      "& .option": {
        "& .user": {
          display: "flex",
          alignItems: "center",
          "& .avatar": {
            margin: "0 5px",
            "&.default": {
              margin: "0 9px",
            }
          }
        }
      },
      "&:hover, &:active, &:focus, &:visited": {
        textDecoration: "none",
        outline: 0
      },
      "&:visited": {
        color: "#333",
      },
      "&:hover, &:active, &:focus": {
        color: "black"
      }
    },
    "&:hover": {
      background: "#f5f5f5",
      color: "black",
      "& .user .name:not(.is-curator)": {
        color: "#1c4263"
      }
    }
  },
  reviewStatus: {
    padding: "6px 0",
    verticalAlign: "middle"
  }
};

@injectStyles(styles)
@observer
export default class User extends React.Component{

  handleSelect = (user, event) => {
    const { onSelect } = this.props;
    typeof onSelect === "function" && onSelect(user, event);
  }

  render() {
    const { classes, user} = this.props;

    const email = (user && user.emails instanceof Array)?user.emails.reduce((email, item) => {
      if (item && item.value && item.verified) {
        if (item.primary || !email) {
          return item;
        }
      }
      return email;
    }, null):null;

    return (
      <MenuItem  key={user.id} className={`quickfire-dropdown-item ${classes.container}`} onSelect={this.handleSelect.bind(this, user)}>
        <div tabIndex={-1} className="option" onKeyDown={this.handleSelect.bind(this, user)}>
          <UserComponent
            userId={user && user.id}
            name={user && user.displayName}
            picture={user && user.picture}
            isCurator={!!user && !!user.isCurator}
            title={email} />
        </div>
      </MenuItem>
    );
  }
}
