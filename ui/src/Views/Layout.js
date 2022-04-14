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

import React from "react";
import { observer } from "mobx-react-lite";
import { Route, Routes, Switch } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { createUseStyles, useTheme } from "react-jss";

import { useStores } from "../Hooks/UseStores";

import Tabs from "./Tabs";
import NotFound from "./NotFound";
import Home from "./Home";
import Login from "./Login";
import Help from "./Help";
import Browse from "./Browse";
import Instance from "./Instance";
import GlobalError from "./GlobalError";
import SpaceModal from "./SpaceModal";

const getGlobalUseStyles = () => createUseStyles(theme => {
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
  };

  if (theme.name === "cupcake") {
    return {
      ...styles,
      ".layout-status": {
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

const useStyles = createUseStyles(theme => ({
  layout: {
    height: "100vh",
    display: "grid",
    overflow: "hidden",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr 20px"
  },
  body: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    backgroundSize: theme.background.size?theme.background.size:(theme.background.image?"unset":"200%"),
    backgroundImage: theme.background.image?`url('${theme.background.image}')`:"unset",
    backgroundPosition: theme.background.position?theme.background.position:"unset"
  },
  status: {
    background: "var(--bg-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    paddingLeft: "10px"
  },
  noAccessModal: {
    maxWidth: "min(max(500px, 50%),750px)",
    "&.modal-dialog": {
      marginTop: "40vh",
      "& .modal-content":{
        backgroundColor: "var(--bg-color-ui-contrast2)",
        color: "var(--ft-color-loud)",
        "& .modal-body": {
          padding: "15px 30px",
          fontSize: "1.6rem"
        }
      }
    }
  },
  actionPanel: {
    textAlign: "center",
    "& button": {
      paddingLeft: "30px",
      paddingRight: "30px"
    }
  },
  footer: {
    position: "relative"
  },
  build: {
    color: "var(--ft-color-loud)",
    position: "absolute",
    top: "0px",
    right: "10px"
  }
}));

const Main = observer(({classes}) => {

  const { appStore, authStore } = useStores();

  const handleLogout = () => appStore.logout();

  if (!appStore.isInitialized || !authStore.isAuthenticated) {
    return (
      <Login />
    );
  }

  if (!authStore.isUserAuthorized) {
    return (
      <Modal dialogClassName={classes.noAccessModal} show={true} onHide={() => {}}>
        <Modal.Body>
          <h1>Welcome</h1>
          <p>You are currently not granted permission to acccess the application.</p>
          <p>Please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
          <div className={classes.actionPanel}>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!authStore.hasSpaces) {
    return (
      <Modal dialogClassName={classes.noAccessModal} show={true} onHide={() => {}}>
        <Modal.Body>
          <h1>Welcome <span title={authStore.firstName}>{authStore.firstName}</span></h1>
          <p>You are currently not granted permission to acccess any spaces.</p>
          <p>Please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
          <div className={classes.actionPanel}>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!appStore.currentSpace) {
    return (
      <SpaceModal/>
    );
  }

  return (
    <Routes>
      <Route path="/instances/:id" element={<Instance mode="view" />} />
      <Route path="/instances/:id/create" element={<Instance mode="create" />} />
      <Route path="/instances/:id/edit" element={<Instance mode="edit" />} />
      <Route path="/instances/:id/graph" element={<Instance mode="graph" />} />
      <Route path="/instances/:id/release" element={<Instance mode="release" />} />
      <Route path="/instances/:id/manage"  element={<Instance mode="manage" />} />
      <Route path="/instances/:id/raw"  element={<Instance mode="raw" />} />

      <Route path="/browse" element={<Browse/>} />
      <Route path="/help" element={<Help/>} />
      <Route path="/" element={<Home/>} />
      <Route element={<NotFound/>} />
    </Routes>
  );
});

const Footer = observer(({classes}) => {
  const { authStore } = useStores();
  const commit = authStore.commit;
  return(
    <div className={classes.footer}>
      <div className={`${classes.status} layout-status`}>
              Copyright &copy; {new Date().getFullYear()} EBRAINS. All rights reserved.
      </div>
      <div className={classes.build}>
        {commit && <span >build: <i>{commit}</i></span>}
      </div>
    </div>
  );
});

const Layout = observer(() => {

  const { appStore } = useStores();
  const theme = useTheme();
  const classes = useStyles({ theme });
  
  const useGlobalStyles = getGlobalUseStyles();
  useGlobalStyles({ theme });

  return (
    <div className={classes.layout}>
      <Tabs />
      <div className={classes.body}>
        {appStore.globalError?<GlobalError />:<Main classes={classes}/>}
      </div>
      <Footer classes={classes}/>
    </div>
  );
});
Layout.displayName = "Layout";

export default Layout;