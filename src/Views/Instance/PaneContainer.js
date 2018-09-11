import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import { observer, Provider, inject } from "mobx-react";

const styles = {
  container: {
    height: "100%",
    width: "100%",
    display: "grid",
    position:"relative",
    overflow: "hidden",
    "--selected-index":"0"
  }
};

@injectStyles(styles)
@inject("instanceStore")
@observer
export default class PaneContainer extends React.Component {
  constructor(props) {
    super(props);
    this.paneStore = new PaneStore();
  }

  render() {
    const { classes } = this.props;
    let selectedIndex = this.paneStore.selectedIndex;
    return (
      <Provider paneStore={this.paneStore}>
        <div className={classes.container} style={{ "--selected-index": selectedIndex }}>
          {this.props.children}
        </div>
      </Provider>
    );
  }
}
