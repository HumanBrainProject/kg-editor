import React from "react";
import injectStyles from "react-jss";
import PaneStore from "../../Stores/PaneStore";
import { observer, Provider } from "mobx-react";

const styles = {
  container: {
    height: "calc(100vh - 90px)",
    width: "auto",
    paddingTop:"0",
    paddingLeft:"10vw",
    margin: "80px 0 10px 0",
    display:"grid",
    gridTemplateRows:"100%",
    gridTemplateColumns:"repeat(100, 80vw)",
    overflow:"visible",
    transition:"all 0.5s ease",
    "@media screen and (min-width:992px)": {
      height: "calc(100vh - 85px)",
      paddingLeft:"25vw",
      margin: "65px 0 20px 0",
      gridTemplateColumns:"repeat(100, 50vw)"
    },
    "@media screen and (min-width:1500px)": {
      height: "calc(100vh - 60px)",
      margin: "40px 0 20px",
    }
  }
};

@injectStyles(styles)
@observer
export default class PaneContainer extends React.Component{
  constructor(props){
    super(props);
    this.paneStore = new PaneStore();
  }

  render(){
    const {classes} =  this.props;
    let selectedIndex = this.paneStore.selectedIndex;
    const step = document.documentElement.clientWidth >= 992?50:80;
    return (
      <Provider paneStore={this.paneStore}>
        <div className={classes.container} style={{transform:`translateX(${selectedIndex*-step}vw)`}}>
          {this.props.children}
        </div>
      </Provider>
    );
  }
}
