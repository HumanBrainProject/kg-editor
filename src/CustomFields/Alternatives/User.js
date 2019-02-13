import React from "react";
import { observer } from "mobx-react";

import UserComponent from "../../Components/User";
import UsersStore from "../../Stores/UsersStore";

@observer
export default class User extends React.Component {
  constructor (props) {
    super(props);
    if (props.userId) {
      UsersStore.fetchUsers(props.userId);
    }
  }

  render() {
    const { userId } = this.props;

    if (!userId) {
      return null;
    }

    const user = UsersStore.getUser(userId);

    return (
      <UserComponent userId={userId} name={user && user.name} picture={user && user.picture} />
    );
  }
}