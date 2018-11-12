import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

import authStore from "../../Stores/AuthStore";
import Features from "./Features";

const styles = {
  container: {
    display:"grid",
    gridTemplateAreas: `"welcome welcome"
                        "features other"`,
    gridTemplateColumns:"1fr 1fr",
    gridTemplateRows:"auto 1fr",
    gridGap: "20px",
    padding: "20px",
    color: "var(--ft-color-normal)"
  },
  welcome: {
    gridArea: "welcome",
    "& h1": {
      margin: "0"
    }
  },
  features: {
    gridArea: "features"
  },
  other: {
    gridArea: "other"
  }
};

@injectStyles(styles)
@observer
export default class Dashboard extends React.Component {
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.container} >
        <div className={classes.welcome}>
          <h1>Welcome <span title={authStore.user.name}>{authStore.user.name.split(" ")[0]}</span></h1>
        </div>
        <div className={classes.features}>
          <Features />
        </div>
      </div>
    );
  }
}