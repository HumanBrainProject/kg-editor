import React from "react";
import { observer, inject, Provider } from "mobx-react";
import InstanceStore from "../Stores/InstanceStore";

import InstanceForm from "./Instance/InstanceForm";
import Pane from "./Instance/Pane";
import Links from "./Instance/Links";
import PaneContainer from "./Instance/PaneContainer";

@inject("navigationStore")
@observer
export default class Edit extends React.Component{
  constructor(props){
    super(props);
    this.store = new InstanceStore(this.props.history, this.props.match.params.id);
    this.props.navigationStore.setInstanceStore(this.store);
  }

  componentWillUnmount() {
    this.props.navigationStore.setInstanceStore(null);
  }

  render(){
    return(
      <Provider instanceStore={this.store}>
        <PaneContainer>
          <React.Fragment>
            <Pane>
              <InstanceForm level={0} id={this.store.mainInstanceId}/>
            </Pane>
            <Links level={1} id={this.store.mainInstanceId}/>
          </React.Fragment>
        </PaneContainer>
      </Provider>
    );
  }
}