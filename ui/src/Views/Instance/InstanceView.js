import React from "react";
import {observer} from "mobx-react";

import instanceStore from "../../Stores/InstanceStore";

import InstanceForm from "./InstanceForm";
import Pane from "./Pane";
import Links from "./Links";
import PaneContainer from "./PaneContainer";

@observer
export default class InstanceView extends React.Component {
  render() {
    const { instanceId, paneStore } = this.props;

    const instance = instanceId?instanceStore.instances.get(instanceId):null;
    if (!instance) {
      return null;
    }

    return (

      <PaneContainer key={instanceId} paneStore={paneStore}>
        <React.Fragment>
          <Pane paneId={instanceId} key={instanceId}>
            <InstanceForm level={0} id={instanceId} mainInstanceId={instanceId} />
          </Pane>
          {!instance.hasFetchError?
            <Links level={1} id={instanceId} mainInstanceId={instanceId} />
            :null}
        </React.Fragment>
      </PaneContainer>
    );
  }
}