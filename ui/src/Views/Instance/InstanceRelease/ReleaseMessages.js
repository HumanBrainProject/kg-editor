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

import React from "react";
import { observer } from "mobx-react";
import releaseStore from "../../../Stores/ReleaseStore";
import Alert from "react-bootstrap/Alert";
import { createUseStyles } from "react-jss";
import { Scrollbars } from "react-custom-scrollbars";

const useStyles = createUseStyles({
  container: {
    width: "100%",
    height: "100%"
  },
  alert: {
    background: "var(--release-color-has-changed)",
    color: "black",
    borderColor: "transparent",
    paddingTop: "6px",
    paddingBottom: "6px",
    marginBottom: "10px"

  }
});

const ReleaseMessages = observer(() => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        {releaseStore.visibleWarningMessages.map(
          (message, index) => (
            <Alert key={`${message}-${index}`} className={classes.alert} >
              {message}
            </Alert>
          )
        )}
      </Scrollbars>
    </div>
  );
});

export default ReleaseMessages;