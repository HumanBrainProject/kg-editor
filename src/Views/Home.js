import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import Hub from "./Home/Hub";
import Features from "./Home/Features";
import authStore from "../Stores/AuthStore";

const styles = {
  container: {
    display:"grid",
    height:"100%",
    width:"100%",
    gridGap:"10px",
    gridTemplateColumns:"1fr 5fr 5fr",
    gridTemplateRows:"auto 1fr",
    gridTemplateAreas: `"nav welcome welcome"
                        "nav main features"`,
    padding:"10px",
    "& .widget":{
      width: "100%",
      height: "100%",
      padding:"10px",
      background:"var(--bg-color-ui-contrast2)",
      border:"1px solid var(--border-color-ui-contrast1)",
      color:"var(--ft-color-normal)",
    }
  },
  nav: {
    gridArea: "nav",
  },
  welcome: {
    gridArea: "welcome",
    "& .widget": {
      background: "none",
      borderColor: "transparent",
      "& h1": {
        margin: "0"
      }
    }
  },
  main: {
    gridArea: "main"
  },
  features: {
    gridArea: "features"
  }
};

@injectStyles(styles)
@observer
export default class Home extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    const { classes } =  this.props;
    return (
      <Scrollbars autoHide>
        <div className={classes.container}>
          <div className={classes.nav}>
            <Hub/>
          </div>
          <div className={classes.welcome}>
            <div className="widget">
              <h1>Welcome <span title={authStore.user.name}>{authStore.user.name.split(" ")[0]}</span></h1>
            </div>
          </div>
          <div className={classes.main}>
            <div className="widget">
            </div>
          </div>
          <div className={classes.features}>
            <Features />
          </div>
        </div>
      </Scrollbars>
    );
  }
}
