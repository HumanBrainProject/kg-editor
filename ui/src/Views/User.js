/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

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