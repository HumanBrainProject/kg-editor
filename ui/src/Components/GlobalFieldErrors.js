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
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";

const useStyles = createUseStyles({
  container: {
    height: "100%",
    color: "var(--ft-color-error)",
    "& h4": {
      marginTop: "30px"
    }
  }
});

const GlobalFieldErrors = observer(({ instance }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <h4>
        {`The ${instance.primaryTypeLabel?instance.primaryTypeLabel:"instance"} ${instance.id} could not be rendered because it contains unexpected type of values in the below fields:`}
      </h4>
      <ul>
        {Object.values(instance.fields).filter(field => field.hasError).map(field => ( // [{field.errorMessage?field.errorMessage.toString():"null"}: {JSON.stringify(field.errorInfo)}]
          <li key={field.fullyQualifiedName}>
            {field.label} ({field.fullyQualifiedName}) with value &quot;{JSON.stringify(field.value)}&quot;
          </li>
        ))}
      </ul>
    </div >
  );
});
GlobalFieldErrors.displayName = "GlobalFieldErrors";

export default GlobalFieldErrors;
