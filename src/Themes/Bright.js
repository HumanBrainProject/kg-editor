import React from "react";
import injectStyles from "react-jss";

const styles = {
  "@global":{
    ":root":{
      "--bg-gradient-start":"#ffffff",
      "--bg-gradient-end":"#a8caba",
      "--bg-gradient-angle":"165deg",

      "--bg-color-ui-contrast1":"#ffffff",
      "--bg-color-ui-contrast2":"#eeeeee",
      "--bg-color-ui-contrast3":"#dddddd",
      "--bg-color-ui-contrast4":"#cccccc",

      "--border-color-ui-contrast1":"#ffffff",
      "--border-color-ui-contrast2":"#ffffff",
      "--border-color-ui-contrast5":"rgba(0, 0, 0, 0.3)",

      "--bg-color-blend-contrast1":"rgba(0, 0, 0, 0.1)",

      "--list-bg-hover":"#def0fd",
      "--list-border-hover":"#68b6f5",
      "--list-bg-selected":"#c6e2f5",
      "--list-border-selected":"#259dff",

      "--ft-color-quiet":"rgba(0, 0, 0, 0.4)",
      "--ft-color-normal":"rgba(0, 0, 0, 0.5)",
      "--ft-color-loud":"#444444",
      "--ft-color-louder":"#222222",

      "--pane-box-shadow":"rgba(0,0,0,0.3)"
    }
  }
};

@injectStyles(styles)
export default class Theme extends React.Component{
  render(){
    return null;
  }
}