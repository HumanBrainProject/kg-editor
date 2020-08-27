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
class PaneContainer extends React.Component {
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

export default PaneContainer;