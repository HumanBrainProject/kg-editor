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

import React, { ReactNode, useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import { Scrollbars } from "react-custom-scrollbars-2";
import debounce from "lodash/debounce";

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
    "& > div": {
      opacity: "0.75",
      transition: "opacity 0.25s ease"
    },
    "&.active > div, &.after:hover > div, &.before:hover > div": {
      opacity: "1"
    }
  },
  scrolledView:{
    padding:"20px"
  }
});

interface PaneProps {
  paneId: string;
  children: ReactNode;
}

const Pane = observer(({ paneId, children }: PaneProps) => {

  const classes = useStyles();

  const paneRef = useRef<HTMLDivElement>(null);

  const view = React.useContext(ViewContext);

  useEffect(() => {
    view.registerPane(paneId);
    return () => {
      view.unregisterPane(paneId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paneId]);

  useEffect(() => {
    if(paneRef.current) {
      const restorePointerEvents = debounce(() => {
        if(paneRef.current) {
          paneRef.current.style.pointerEvents = "auto";
        }
      }, 1000);
      if (view.selectedPane !== paneId) {
        paneRef.current.style.pointerEvents = "none";
        restorePointerEvents();
      } else {
        paneRef.current.style.pointerEvents = "auto";
        restorePointerEvents.cancel();
      }
    }
  }, [view.selectedPane, paneId]);

  const handleFocus = () => {
    if (view.selectedPane !== paneId) {
      view.selectPane(paneId);
    }
  };

  const geActiveClass = () => {
    if(paneId === view.selectedPane) {
      return "active";
    }
    if(index > view.selectedPaneIndex) {
      return "after";
    }
    return "before";
  }

  const index = view.getPaneIndex(paneId);
  const mainClass = index === 0?"main":"";
  const activeClass = geActiveClass();
  return (
    <PaneContext.Provider value={paneId} >
      <div ref={paneRef} className={`${classes.pane} ${mainClass} ${activeClass}`} style={{"--pane-index":index}} onFocus={handleFocus} onClick={handleFocus}>
        <Scrollbars autoHide>
          <div className={`${classes.scrolledView} scrolledView`} >
            {children}
          </div>
        </Scrollbars>
      </div>
    </PaneContext.Provider>
  );
});
Pane.displayName = "Pane";

export default Pane;