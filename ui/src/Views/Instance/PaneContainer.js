import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import { observer, Provider } from "mobx-react";

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
@observer
export default class PaneContainer extends React.Component {
  constructor(props) {
    super(props);
    if(!this.props.paneStore){
      this.paneStore = new PaneStore();
    } else {
      this.paneStore = this.props.paneStore;
    }
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
