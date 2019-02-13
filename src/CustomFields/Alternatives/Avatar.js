import React from "react";
import { observer } from "mobx-react";

import AvatarComponent from "../../Components/Avatar";
import UsersStore from "../../Stores/UsersStore";

@observer
export default class Avatar extends React.Component {
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
      <AvatarComponent userId={userId} name={user && user.name} picture={user && user.picture} />
    );
  }
}