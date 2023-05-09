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

import React, { useEffect, useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import { List } from "react-virtualized";
import { observer } from "mobx-react-lite";
import debounce from "lodash/debounce";

import useStores from "../../../Hooks/useStores";

import ReleaseNode from "./ReleaseNode";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width:"100%",
    height:"100%",
    maxHeight: "100%"
  }
});

const ReleaseList = observer(() => {

  const wrapperRef = useRef();

  const classes = useStyles();

  const { releaseStore } = useStores();

  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  useEffect(() => {

    const updateDimensions = debounce(() => {
      if(wrapperRef.current) {
        setDimensions({width:  wrapperRef.current.offsetWidth, height: wrapperRef.current.offsetHeight});
      }
    }, 250);

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const rowRenderer = ({ key, index, style }) => {
    const rowData =  releaseStore.instanceList[index];
    return (
      <div key={key} style={style}>
        <ReleaseNode node={rowData.node} level={rowData.level} />
      </div>
    );
  };

  return (
    <div ref={wrapperRef} className={classes.container}>
      <List
        width={dimensions.width}
        height={dimensions.height}
        rowHeight={42}
        rowCount={releaseStore.instanceList.length}
        rowRenderer={rowRenderer}
      />
    </div>
  );
});
ReleaseList.displayName = "ReleaseList";

export default ReleaseList;