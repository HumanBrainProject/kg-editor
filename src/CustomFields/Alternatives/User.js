import React from "react";
import { observer } from "mobx-react";

import UserComponent from "../../Components/User";
import UsersStore from "../../Stores/UsersStore";

@observer
export default class User extends React.Component {
  constructor (props) {
    super(props);
    if (props.userId) {
      UsersStore.fetchUser(props.userId);
    }
  }

  render() {
    const { userId } = this.props;

    if (!userId) {
      return null;
    }

    const user = UsersStore.getUser(userId);

    const email = (user && user.emails instanceof Array)?user.emails.reduce((email, item) => {
      if (item && item.value && item.verified) {
        if (item.primary || !email) {
          return item;
        }
      }
      return email;
    }, null):null;

    return (
      <UserComponent userId={userId} name={user && user.displayName} picture={user && user.picture} title={email && email.value} />
    );
  }
}