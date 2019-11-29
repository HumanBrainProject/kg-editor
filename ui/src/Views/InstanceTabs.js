import React from "react";
import { observer } from "mobx-react";
import { matchPath } from "react-router-dom";
import injectStyles from "react-jss";

import appStore from "../Stores/AppStore";
import authStore from "../Stores/AuthStore";
import instanceStore from "../Stores/InstanceStore";
import instanceTabStore from "../Stores/InstanceTabStore";

import Tab from "../Components/Tab";

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 0.5fr))"
  }
};

@injectStyles(styles)
@observer
class InstanceTabs extends React.Component {
  handleCloseInstance(instanceId) {
    appStore.closeInstance(instanceId);
  }

  render() {
    const { classes, pathname } = this.props;
    return (
      <div className={classes.container} >
        {authStore.isFullyAuthenticated && Array.from(instanceTabStore.instanceTabs.keys()).map(instanceId => {
          const instance = instanceStore.instances.get(instanceId);
          const mode = instanceTabStore.instanceTabs.get(instanceId).viewMode;
          let label;
          let color = undefined;
          if (instance && instance.isFetched) {
            const labelField = instance.labelField;
            const field = labelField && instance.form.getField(labelField);
            label = field ? field.getValue() : instanceId;
            color = instance.primaryType.color;
          }
          if (!label) {
            label = instanceId;
          }
          return (
            <Tab
              key={instanceId}
              icon={instance && instance.isFetching ? "circle-notch" : "circle"}
              iconSpin={instance && instance.isFetching}
              iconColor={color}
              current={matchPath(pathname, { path: `/instance/${mode}/${instanceId}`, exact: "true" })}
              path={`/instance/${mode}/${instanceId}`}
              onClose={this.handleCloseInstance.bind(this, instanceId)}
              label={label} />
          );
        })}
      </div>
    );
  }
}

export default InstanceTabs;
