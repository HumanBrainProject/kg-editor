/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */
import { DefaultTheme, createUseStyles, useTheme } from "react-jss";

const getBtnLinkStyle = theme => {
  if (theme.name === "bright") {
    return {
      color: "var(--ft-color-selected)"
    };
  }
  return {};
};

const getBtnLinkHoverStyle = theme => {
  if (theme.name === "bright") {
    return {
      color: "var(--ft-color-selected-hover)"
    }
  }
  return {};
};

const getPrimaryBtnStyle = theme => {
  if (theme.name === "bright") {
    return {
      backgroundColor: "#45b07c",
      borderColor: "#3e9e6f"
    };
  }
  return {};
};

const getPrimaryBtnHoverStyle = theme => {
  if (theme.name === "bright") {
    return {
      backgroundColor: "#378b62",
      borderColor: "#3e9e6f"
    };
  }
  return {};
};

const getUseStyles = () => createUseStyles((theme: Jss.Theme)  => {
  const styles = {
    "@global": {
      ":root": {
        "--bg-gradient-start": theme.background.gradient.colorStart,
        "--bg-gradient-end": theme.background.gradient.colorEnd,
        "--bg-gradient-angle": theme.background.gradient.angle,

        "--bg-color-ui-contrast1": theme.contrast1.backgroundColor,
        "--bg-color-ui-contrast2": theme.contrast2.backgroundColor,
        "--bg-color-ui-contrast3": theme.contrast3.backgroundColor,
        "--bg-color-ui-contrast4": theme.contrast4.backgroundColor,
        "--bg-color-ui-contrast6": theme.contrast6.backgroundColor,

        "--button-primary-bg-color": theme.button.primary.backgroundColor,
        "--button-primary-border-color": theme.button.primary.borderColor,
        "--button-primary-active-bg-color": theme.button.primary.active.backgroundColor,
        "--button-primary-active-border-color": theme.button.primary.active.borderColor,

        "--button-secondary-bg-color": theme.button.secondary.backgroundColor,
        "--button-secondary-border-color": theme.button.secondary.borderColor,
        "--button-secondary-active-bg-color": theme.button.secondary.active.backgroundColor,
        "--button-secondary-active-border-color": theme.button.secondary.active.borderColor,

        "--border-color-ui-contrast1": theme.contrast1.borderColor,
        "--border-color-ui-contrast2": theme.contrast2.borderColor,
        "--border-color-ui-contrast5": theme.contrast5.borderColor,
        "--border-color-ui-contrast6": theme.contrast6.borderColor,

        "--bg-color-blend-contrast1": theme.blendContrast1.backgroundColor,

        "--list-bg-hover": theme.list.hover.backgroundColor,
        "--list-border-hover": theme.list.hover.borderColor,
        "--list-bg-selected": theme.list.selected.backgroundColor,
        "--list-border-selected": theme.list.selected.borderColor,

        "--ft-color-quiet": theme.quiet.color,
        "--ft-color-normal": theme.normal.color,
        "--ft-color-loud": theme.loud.color,
        "--ft-color-louder": theme.louder.color,

        "--ft-color-error": theme.error.color,
        "--bg-color-error-quiet": theme.error.quiet.color,
        "--bg-color-error-normal": theme.error.normal.color,
        "--bg-color-error-loud": theme.error.loud.color,

        "--bg-color-warn-quiet": theme.warn.quiet.backgroundColor,
        "--bg-color-warn-normal": theme.warn.normal.backgroundColor,
        "--bg-color-warn-loud": theme.warn.loud.backgroundColor,
        "--ft-color-warn": theme.warn.color,

        "--ft-color-info": theme.info.color,
        "--bg-color-info-normal": theme.info.normal.color,

        "--ft-color-selected": theme.selected.color,
        "--ft-color-selected-hover": theme.selected.hover.color,

        "--link-ft-color-hover": theme.link.hover.color,
        "--link-bg-color-hover": theme.link.hover.backgroundColor,
        "--link-border-color-hover": theme.link.hover.borderColor,
        "--link-bg-color-hover-quiet": theme.link.quiet.hover.backgroundColor,

        "--pane-box-shadow": theme.pane.boxShadow.color,

        "--release-status-box-shadow": theme.release.status.boxShadow,
        "--release-color-released": theme.release.status.released.color,
        "--release-bg-released": theme.release.status.released.backgroundColor,
        "--release-color-not-released": theme.release.status.notReleased.color,
        "--release-bg-not-released": theme.release.status.notReleased.backgroundColor,
        "--release-color-has-changed": theme.release.status.hasChanged.color,
        "--release-bg-has-changed": theme.release.status.hasChanged.backgroundColor,

        "--release-color-highlight": theme.release.highlight.color,
        "--release-bg-highlight": theme.release.highlight.backgroundColor,

        "--bookmark-on-color": theme.bookmark.on.color,
        "--bookmark-on-color-highlight": theme.bookmark.on.highlight.color,
        "--bookmark-off-color":"var(--ft-color-normal)",
        "--bookmark-off-color-highlight":"var(--bookmark-on-color-highlight)"
      }
    },
    "@global html, body, #root": {
      height: "100%",
      overflow: "hidden",
      textRendering: "optimizeLegibility",
      "-webkit-font-smoothing": "antialiased",
      "-webkit-tap-highlight-color": "transparent",
      fontFamily: "Lato, sans-serif",
      fontSize: "14px"
    },
    "@global *": {
      boxSizing: "border-box"
    },
    "@global button, @global input[type=button], @global a": {
      "-webkit-touch-callout": "none",
      userSelect: "none"
    },
    "@global .btn-link": getBtnLinkStyle(theme),
    "@global .btn-link:hover": getBtnLinkHoverStyle(theme),
    "@global .btn-primary": getPrimaryBtnStyle(theme),
    "@global .btn-primary:hover": getPrimaryBtnHoverStyle(theme)
    // "@global .modal .btn-link": getBtnLinkStyle(theme),
    // "@global .modal .btn-link:hover": getBtnLinkStyle(theme),
    // "@global .modal .btn-primary": getPrimaryBtnStyle(theme),
    // "@global .modal .btn-primary:hover": getPrimaryBtnHoverStyle(theme),
    // "@global [role=\"tooltip\"] .btn-link": getBtnLinkStyle(theme),
    // "@global [role=\"tooltip\"] .btn-link:hover": getBtnLinkStyle(theme),
    // "@global [role=\"tooltip\"] .btn-primary": getPrimaryBtnStyle(theme),
    // "@global [role=\"tooltip\"] .btn-primary:hover": getPrimaryBtnHoverStyle(theme)
  };
  
  if (theme.name === "cupcake") {
    return {
      ...styles,
      ".copyright": {
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
      ".layout-logo": {
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
    };
  }

  return styles;
});

const Styles = () => {

  const theme = useTheme<DefaultTheme>();
  
  const useStyles = getUseStyles();
  useStyles({ theme });

  return null;
};

export default Styles;