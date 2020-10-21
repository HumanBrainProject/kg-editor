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

import React, { useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import { debounce } from "lodash";

import { ViewContext, PaneContext } from "../../Stores/ViewStore";

const useStyles = createUseStyles({
  pane: {
    position:"absolute",
    width:"50%",
    height:"calc(100% - 40px)",
    top:"20px",
    "--pane-index":"0",
    left:"calc(calc(50% * calc(var(--pane-index) - var(--selected-index))) + 25%)",
    overflow: "auto",
    background: "#ebebeb",
    boxShadow: "0 2px 10px var(--pane-box-shadow)",
    transform: "scale(0.90)",
    transition: "left 0.5s ease, transform 0.5s ease",
    "&.active": {
      background: "#f5f5f5",
      transform: "scale(1)"
    },
    "&.main, &.main.active": {
      background: "white"
    },
    "&:hover": {
      zIndex: 2
    },
    "&.after:hover": {
      transform: "scale(0.95) translateX(-50%)"
    },
    "&.before:hover": {
      transform: "scale(0.95) translateX(50%)"
    },
    "& > div": {
      opacity: "0.75",
      transition: "opacity 0.25s ease"
    },
    "&.active > div, &.after:hover > div, &.before:hover > div": {
      opacity: "1"
    }
  },
  scrolledView:{
    padding:"20px",
  }
});

const PaneWithContext = observer(({ view, paneId, children }) => {

  const classes = useStyles();

  const paneRef = useRef();

  const restorePointerEvents = debounce(() => {
    paneRef.current.style.pointerEvents = "auto";
  }, 1000);

  useEffect(() => {
    if(paneRef.current) {
      if (view.selectedPane !== paneId) {
        paneRef.current.style.pointerEvents = "none";
        restorePointerEvents();
      } else {
        paneRef.current.style.pointerEvents = "auto";
        restorePointerEvents.cancel();
      }
    }
  }, [view.selectedPane]);

  const handleFocus = () => {
    if (view.selectedPane !== paneId) {
      view.selectPane(paneId);
    }
  };

  const index = view.getPaneIndex(paneId);
  const mainClass = index === 0?"main":"";
  const activeClass = paneId === view.selectedPane?"active":(index > view.selectedPaneIndex?"after":"before");

  return (
    <div ref={paneRef} className={`${classes.pane} ${mainClass} ${activeClass}`} style={{"--pane-index":index}} onFocus={handleFocus} onClick={handleFocus}>
      <Scrollbars autoHide>
        <div className={classes.scrolledView}>
          {children}
        </div>
      </Scrollbars>
    </div>
  );
});

const WrappedPane = observer(({ view, paneId, children }) => {

  useEffect(() => {
    view.registerPane(paneId);
    return () => {
      view.unregisterPane(paneId);
    };
  }, []);

  return (
    <PaneContext.Provider value={paneId} >
      <PaneWithContext view={view} paneId={paneId}>
        {children}
      </PaneWithContext>
    </PaneContext.Provider>
  );
});

const Pane = ({paneId, children}) => (
  <ViewContext.Consumer>
    {view => (
      <WrappedPane view={view} paneId={paneId} >
        {children}
      </WrappedPane>
    )}
  </ViewContext.Consumer>
);

export default Pane;