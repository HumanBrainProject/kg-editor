import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../Stores/AppStore";
import MultiToggle from "../../Components/MultiToggle";

const styles = {
  container:{
    textAlign:"center"/*,
    marginBottom:"10px"*/
  },
  icon:{
    color:"var(--ft-color-normal)",
    fontSize:"3em",
    marginBottom:"3px"//"10px"
  }
};

@injectStyles(styles)
@observer
export default class ThemeSwitcher extends React.Component{
  handleChange = (theme) => {
    appStore.setTheme(theme);
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.icon}>
          <FontAwesomeIcon icon={appStore.currentTheme === "bright"? "sun": "moon"}/>
        </div>
        <div className={classes.switcher}>
          <MultiToggle selectedValue={appStore.currentTheme} onChange={this.handleChange}>
            <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"moon"} value="default"/>
            <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"sun"} value="bright"/>
          </MultiToggle>
        </div>
      </div>
    );
  }
}