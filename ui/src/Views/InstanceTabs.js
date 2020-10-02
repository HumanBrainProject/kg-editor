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

  componentDidMount() {
    this.syncInstanceLabel();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.instanceId !== this.props.instanceId) {
      this.syncInstanceLabel();
    }
  }

  syncInstanceLabel = () => {
    const { view } = this.props;
    const instance = instanceStore.instances.get(view.instanceId);
    if (instance && instance.name !== view.instanceId && instance.primaryType.color !== view.color) {
      view.setNameAndColor(instance.name, instance.primaryType.color);
      viewStore.syncStoredViews();
    }
  }

  handleClose = () => {
    const { instanceId } = this.props;
    instanceId && appStore.closeInstance(instanceId);
  }

  render() {
    const { view, pathname } = this.props;

    const instance = instanceStore.instances.get(view.instanceId);
    const label = (instance && (instance.isFetched || instance.isLabelFetched))?instance.name:(view.name?view.name:view.instanceId);
    const color = (instance && (instance.isFetched || instance.isLabelFetched))?instance.primaryType.color:(view.color?view.color:"");
    return (
      <Tab
        icon={instance && instance.isFetching ? "circle-notch" : "circle"}
        iconSpin={instance && instance.isFetching}
        iconColor={color}
        current={matchPath(pathname, { path: `/instance/${view.mode}/${view.instanceId}`, exact: "true" })}
        path={`/instance/${view.mode}/${view.instanceId}`}
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
        {authStore.isFullyAuthenticated && Array.from(viewStore.views.values()).map(view => (
          <InstanceTab key={view.instanceId} view={view} pathname={pathname} instanceId={view.instanceId} />
        ))}
      </div>
    );
  }
}

export default InstanceTabs;
