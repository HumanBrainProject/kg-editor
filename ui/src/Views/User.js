import React from "react";
import { observer } from "mobx-react";

import UserComponent from "../Components/User";
import UsersStore from "../Stores/UsersStore";

@observer
export default class User extends React.Component {
  componentDidMount() {
    if (this.props.userId) {
      UsersStore.fetchUser(this.props.userId);
    }
  }

  render() {
    const { userId } = this.props;
    const user = UsersStore.users.get(userId);

    const email = (user && user.emails instanceof Array)?user.emails.reduce((email, item) => {
      if (item && item.value && item.verified) {
        if (item.primary || !email) {
          return item;
        }
      }
      return email;
    }, null):null;

    return (
      userId ? <UserComponent userId={userId} name={user && user.displayName} picture={user && user.picture} isCurator={!!user && !!user.isCurator} title={email && email.value} />: null
    );
  }
}