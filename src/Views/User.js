import React from "react";
import { observer } from "mobx-react";

import UserComponent from "../Components/User";
import UsersStore from "../Stores/UsersStore";

@observer
export default class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user:null
    };
  }

  async componentDidMount() {
    if (this.props.userId) {
      try {
        const response = await UsersStore.fetchUser(this.props.userId);
        this.setState({ user: response });
      } catch (error) {
        this.setState({user:null});
      }
    }
  }

  render() {
    const { userId } = this.props;
    const user = this.state.user;

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