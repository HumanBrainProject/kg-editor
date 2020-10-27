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

const useStyles = createUseStyles({
  dropdownMenu: {
    background: "var(--ft-color-loud)",
    fontSize: "0.9em"
  },
  list: {
    paddingLeft: "0",
    listStyle: "none",
    marginBottom: "0",
    "& .dropdown-item": {
      lineHeight: "1.3rem",
      padding: "4px 8px"
    }
  }
});


const CustomDropdownMenu = React.forwardRef(
  ({ children, className, "aria-labelledby": labeledBy }, ref) => {
    const classes = useStyles();

    return (
      <div ref={ref} className={`${className} ${classes.dropdownMenu}`} aria-labelledby={labeledBy}>
        <ul className={classes.list}>
          {children}
        </ul>
      </div>
    );
  },
);

CustomDropdownMenu.displayName = "CustomDropdownMenu";

export default CustomDropdownMenu;