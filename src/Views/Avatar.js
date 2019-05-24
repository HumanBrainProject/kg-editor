import React from "react";
import { observer } from "mobx-react";

import AvatarComponent from "../Components/Avatar";
import UsersStore from "../Stores/UsersStore";

@observer
export default class Avatar extends React.Component {
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

    return (
      userId ? <AvatarComponent userId={userId} name={this.state.user && this.state.user.displayName} picture={this.state.user && this.state.user.picture} />:null
    );
  }
}