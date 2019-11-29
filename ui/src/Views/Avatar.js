import React from "react";
import { observer } from "mobx-react";

import AvatarComponent from "../Components/Avatar";
import UsersStore from "../Stores/UsersStore";

@observer
class Avatar extends React.Component {
  componentDidMount() {
    if (this.props.userId) {
      UsersStore.fetchUser(this.props.userId);
    }
  }

  render() {
    const { userId } = this.props;

    const user = UsersStore.users.get(userId);

    return (
      userId ? <AvatarComponent userId={userId} name={user && user.displayName} picture={user && user.picture} />:null
    );
  }
}

export default Avatar;