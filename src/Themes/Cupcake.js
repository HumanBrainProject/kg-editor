import React from "react";
import injectStyles from "react-jss";

import Color from "color";

const styles = {
  "@global":{
    ":root":{
      "--bg-gradient-start":"#e5b8d6",
      "--bg-gradient-end":"#edac95",
      "--bg-gradient-angle":"165deg",

      "--bg-color-ui-contrast1":new Color("#94789a").darken(0.5).rgb().string(),
      "--bg-color-ui-contrast2":new Color("#94789a").darken(0.3).rgb().string(),
      "--bg-color-ui-contrast3":new Color("#94789a").darken(0.1).rgb().string(),
      "--bg-color-ui-contrast4":new Color("#94789a").darken(0).rgb().string(),

      "--border-color-ui-contrast1":new Color("#94789a").darken(0.2).rgb().string(),
      "--border-color-ui-contrast2":new Color("#94789a").darken(0.5).rgb().string(),
      "--border-color-ui-contrast5":new Color("#94789a").lighten(0.5).rgb().string(),

      "--bg-color-blend-contrast1":"rgba(0, 0, 0, 0.2)",

      "--list-bg-hover":new Color("#d8afae").alpha(0.5).rgb().string(),
      "--list-border-hover":new Color("#f4b3a9").alpha(0.5).rgb().string(),
      "--list-bg-selected":"#d8afae",
      "--list-border-selected":"#f4b3a9",

      "--ft-color-quiet":new Color("#f6bec9").alpha(0.4).rgb().string(),
      "--ft-color-normal":new Color("#f6bec9").alpha(0.6).rgb().string(),
      "--ft-color-loud":new Color("#f6bec9").alpha(0.8).rgb().string(),
      "--ft-color-louder":new Color("#f6bec9").alpha(1).rgb().string(),

      "--pane-box-shadow":"#333",

      "--release-color-released":"rgb(52, 152, 219)",
      "--release-bg-released":"rgba(52, 152, 219, 0.25)",
      "--release-color-not-released":"rgb(231, 76, 60)",
      "--release-bg-not-released":"rgba(231, 76, 60, 0.25)",
      "--release-color-has-changed":"rgb(241, 196, 15)",
      "--release-bg-has-changed":"rgba(241, 196, 15, 0.25)",

      "--release-color-highlight":"rgb(46, 204, 113)",
      "--release-bg-highlight":"rgb(46, 204, 113, 0.25)",
      "--bookmark-on-color":"#EFEC2D",
      "--bookmark-on-color-highlight":"#ffe100",
      "--bookmark-off-color":"var(--ft-color-normal)",
      "--bookmark-off-color-highlight":"var(--bookmark-on-color-highlight)"
    },
    ".layout-status":{
      "background": "linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3) !important",
      "background-size": "180% 180% !important",
      animation: "rainbow 3s linear infinite !important",
      "border-top":"1px solid var(--border-color-ui-contrast2)"
    },
    "@keyframes rainbow": {
      "0%":{"background-position":"0% 82%"},
      "50%":{"background-position":"100% 19%"},
      "100%":{"background-position":"0% 82%"}
    },
    ".layout-logo":{
      backgroundImage:"url(https://vignette.wikia.nocookie.net/nyancat/images/f/fd/Taxac_Naxayn.gif/revision/latest/scale-to-width-down/2000?cb=20180518022723)",
      "background-size": "50px 30px",
      "background-repeat": "no-repeat",
      "background-position": "5px 9px",
      "padding-left": "50px !important",
      "padding-top": "14px !important",
      "& img":{
        display:"none"
      }
    }
  }
};

@injectStyles(styles)
export default class Theme extends React.Component{
  render(){
    return null;
  }
}