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
import { createUseStyles, useTheme } from "react-jss";

import Styles from "./Styles";
import Tabs from "./Tabs";
import Footer from "./Footer";

const getBackgroundSize = theme => {
  if(theme.background.size) {
    return theme.background.size;
  }
  if(theme.background.image) {
    return "unset";
  }
  return "200%";
};

const useStyles = createUseStyles(theme => ({
  container: {
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
    backgroundSize: getBackgroundSize(theme),
    backgroundImage: theme.background.image?`url('${theme.background.image}')`:"unset",
    backgroundPosition: theme.background.position?theme.background.position:"unset",
    backgroundColor: theme.backgroundColor?theme.backgroundColor:"unset",
  },
}));

const Layout = ({ children }) => {

  const theme = useTheme();
  const classes = useStyles({ theme });
  
  return (
    <>
      <Styles />
      <div className={classes.container}>
        <Tabs />
        <div className={classes.body}>
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;