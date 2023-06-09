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

import React, { useState } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { createUseStyles } from "react-jss";

import Filter from "./Filter";

const useStyles = createUseStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--border-color-ui-contrast1)",
    boxShadow: "0 2px 10px var(--pane-box-shadow)"
  },
  body: {
    flex: 1,
    padding: "0 0 10px 0"
  },
  list: {
    listStyleType: "none",
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gridGap: "10px",
    margin: 0,
    padding: "0 10px",
    "@media screen and (min-width:1200px)": {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    "@media screen and (min-width:1600px)": {
      gridTemplateColumns: "repeat(3, 1fr)"
    }
  },
  item: {
    position: "relative",
    padding: "15px",
    background: "var(--bg-color-ui-contrast3)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderRadius: "10px",
    cursor: "pointer",
    wordBreak: "break-word",
    transition: "background .3s ease-in-out, color .3s ease-in-out",
    "&:hover": {
      background: "var(--bg-color-blend-contrast1)",
      color: "var(--ft-color-loud)"
    }
  }
});

interface GridSelectorProps<T> {
  list: T[];
  itemComponent: React.ComponentType<{ item: T }>;
  getKey: (item: T) => string;
  onSelect: (item: T) => void;
  onFilter: (list: T[], term: string) => T[];
  filterPlaceholder?: string;
  className?: string;
}

const GridSelector = <T,>({ list, itemComponent, getKey, onSelect, onFilter, filterPlaceholder, className }: GridSelectorProps<T>) => {
  
  const classes = useStyles();

  const [filter, setFilter] = useState<string>("");

  const getFilteredList = (list: T[], term: string) => {
    term = term && term.trim().toLowerCase();
    if(term) {
      return onFilter(list, term);
    }
    return list;
  };

  const filteredList = getFilteredList(list, filter);

  const ItemComponent = itemComponent;

  return (
    <div className={`${classes.container} ${className?className:''}`}>
      <Filter
        value={filter}
        placeholder={filterPlaceholder}
        onChange={setFilter}
      />
      <div className={classes.body}>
        <Scrollbars autoHide>
          <ul className={classes.list}>
            {filteredList.map(item => (
              <li key={getKey(item)} className={classes.item} onClick={() => onSelect(item)}>
                <ItemComponent item={item} />
              </li>
            ))}
          </ul>
        </Scrollbars>
      </div>
    </div>
  );
};

export default GridSelector;