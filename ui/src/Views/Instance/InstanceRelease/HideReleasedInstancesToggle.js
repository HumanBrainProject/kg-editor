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
import { createUseStyles } from "react-jss";
import MultiToggle from "../../../Components/MultiToggle";

import { useStores } from "../../../Hooks/useStores";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "row"
  },
  toggle: {
    height: "24px",
    background: "var(--bg-color-ui-contrast4)",
    borderRadius: "20px"
  },
  text: {
    display: "inline-block",
    marginLeft: "4px",
    lineHeight: "1.7em"
  }
});

const HideReleasedInstancesToggle = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleClick = showAll => releaseStore.toggleHideReleasedInstances(!!showAll);

  return (
    <div className={classes.container}>
      <div className={classes.toggle}>
        <MultiToggle selectedValue={releaseStore.hideReleasedInstances} onChange={handleClick}>
          <MultiToggle.Toggle color={releaseStore.hideReleasedInstances?"var(--ft-color-normal)":"var(--ft-color-loud)"} icon={"eye"} value={false} />
          <MultiToggle.Toggle color={releaseStore.hideReleasedInstances?"var(--ft-color-loud)":"var(--ft-color-normal)"} icon={"eye-slash"} value={true} />
        </MultiToggle>
      </div>
      <span className={classes.text}>{releaseStore.hideReleasedInstances?"Hide": "Show"} released instances</span>
    </div>
  );
});
HideReleasedInstancesToggle.displayName = "HideReleasedInstancesToggle";

export default HideReleasedInstancesToggle;