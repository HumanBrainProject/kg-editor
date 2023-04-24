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
import { createUseStyles } from "react-jss";
import {observer} from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/useStores";

import MultiToggle from "../../Components/MultiToggle";

const useStyles = createUseStyles({
  container:{
    textAlign: "right",
    paddingTop: "35px"
  },
  icon:{
    color:"var(--ft-color-normal)",
    fontSize:"3em",
    marginBottom:"3px"//"10px"
  }
});

const ThemeSwitcher = observer(() => {

  const classes = useStyles();

  const { appStore } = useStores();

  const handleChange = theme => appStore.setTheme(theme);

  return (
    <div className={classes.container}>
      <div className={classes.icon}>
        <FontAwesomeIcon icon={appStore.currentTheme.name === "bright"? "sun": "moon"}/>
      </div>
      <div className={classes.switcher}>
        <MultiToggle selectedValue={appStore.currentTheme.name} onChange={handleChange}>
          <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"moon"} value="default"/>
          <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"sun"} value="bright"/>
        </MultiToggle>
      </div>
    </div>
  );
});
ThemeSwitcher.displayName = "ThemeSwitcher";

export default ThemeSwitcher;