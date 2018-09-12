import React from "react";
import { observer, inject, Provider } from "mobx-react";
import injectStyles from "react-jss";

import InstanceStore from "../Stores/InstanceStore";

import InstanceForm from "./Instance/InstanceForm.js";
import Pane from "./Instance/Pane";
import Links from "./Instance/Links";
import PaneContainer from "./Instance/PaneContainer";
import SavePanel from "./Instance/SavePanel";

const styles = {
  container:{
    display:"grid",
    height:"100%",
    gridTemplateRows:"100%",
    gridTemplateColumns:"1fr 400px"
  },
  body:{
    position:"relative",
    overflow:"hidden"
  },
  sidebar:{
    background:"white",
    borderLeft:"1px solid #ccc",
    overflow:"auto"
  }
};

@injectStyles(styles)
@inject("navigationStore")
@observer
export default class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.store = new InstanceStore(this.props.history, this.props.match.params.id);
    this.props.navigationStore.setInstanceStore(this.store);
    if(this.props.refInstanceStore){
      this.props.refInstanceStore(this.store);
    }
  }

  componentWillUnmount() {
    this.props.navigationStore.setInstanceStore(null);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.store.setMainInstance(newProps.match.params.id);
  }

  render() {
    const {classes} = this.props;
    return (
      <Provider instanceStore={this.store}>
        <div className={classes.container}>
          <div className={classes.body}>
            <PaneContainer>
              <React.Fragment>
                <Pane>
                  <InstanceForm level={0} id={this.store.mainInstanceId} />
                </Pane>
                <Links level={1} id={this.store.mainInstanceId} />
              </React.Fragment>
            </PaneContainer>
          </div>
          <div className={classes.sidebar}>
            <SavePanel/>
          </div>
        </div>
      </Provider>
    );
  }
}