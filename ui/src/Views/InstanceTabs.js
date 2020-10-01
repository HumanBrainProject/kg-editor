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
import { matchPath } from "react-router-dom";
import injectStyles from "react-jss";

import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";
import instanceStore from "../Stores/InstanceStore";
import viewStore from "../Stores/ViewStore";

import Tab from "../Components/Tab";

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 0.5fr))"
  }
};
@observer
class InstanceTab extends React.Component {

  /* use local storage info for name
  componentDidMount() {
    this.fetchInstanceLabel();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.instanceId !== this.props.instanceId) {
      this.fetchInstanceLabel();
    }
  }

  fetchInstanceLabel = () => {
    const { instanceId } = this.props;
    instanceId && instanceStore.createInstanceOrGet(instanceId).fetchLabel();
  };
  */

  handleClose = () => {
    const { instanceId } = this.props;
    instanceId && appStore.closeInstance(instanceId);
  }

  render() {
    const { instanceId, name, mode, pathname } = this.props;

    const instance = instanceStore.instances.get(instanceId)
    const label = instance?instance.name:(name?name:instanceId);
    const color = ((instance && instance.isFetched && instance.primaryType.color))?instance.primaryType.color:undefined;

    return (
      <Tab
        icon={instance && instance.isFetching ? "circle-notch" : "circle"}
        iconSpin={instance && instance.isFetching}
        iconColor={color}
        current={matchPath(pathname, { path: `/instance/${mode}/${instanceId}`, exact: "true" })}
        path={`/instance/${mode}/${instanceId}`}
        onClose={this.handleClose}
        label={label} 
      />
    );
  }
}

@injectStyles(styles)
@observer
class InstanceTabs extends React.Component {
  render() {
    const { classes, pathname } = this.props;
    return (
      <div className={classes.container} >
        {authStore.isFullyAuthenticated && Array.from(viewStore.views.entries()).map(([instanceId, infos]) => (
          <InstanceTab key={instanceId} instanceId={instanceId} name={infos.name} mode={infos.mode} pathname={pathname} />
        ))}
      </div>
    );
  }
}

export default InstanceTabs;
