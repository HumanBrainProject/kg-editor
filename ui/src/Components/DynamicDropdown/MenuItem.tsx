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

import React, {useRef, useEffect, KeyboardEvent} from "react";
import { createUseStyles } from "react-jss";
import DynamicOption from "../../Fields/DynamicOption/DynamicOption";
import { Suggestion } from "../../types";

const useStyles = createUseStyles({
  item: {
    paddingLeft: "10px",
    paddingRight: 0,
    cursor: "default",
    "&:hover, &:active, &:focus": {
      outline: 0
    }
  }
});

interface MenuItemProps {
  item: Suggestion;
  searchTerm: string;
  hasFocus: boolean;
  onSelectNext: (item: Suggestion) => void;
  onSelectPrevious: (item: Suggestion) => void;
  onSelect: (item: Suggestion) => void;
  onCancel: () => void;
}

const MenuItem = ({ item, searchTerm, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel }: MenuItemProps) => {

  const classes = useStyles();

  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (hasFocus) {
      ref.current?.focus();
    }
  });

  const handleOnSelect = () => onSelect(item);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if(e) {
      switch(e.key) {
      case "ArrowUp": {
        e.preventDefault();
        onSelectPrevious(item);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        onSelectNext(item);
        break;
      }
      case "Enter": {
        e.preventDefault();
        onSelect(item);
        break;
      }
      case "Escape": {
        e.preventDefault();
        onCancel();
        break;
      }
      default:
        break;
      }
    }
  };

  return (
    <li tabIndex={0} className={`dropdown-item ${classes.item}`} onClick={handleOnSelect} onKeyDown={handleKeyDown} ref={ref}>
      <DynamicOption item={item} searchTerm={searchTerm}/>
    </li>
  );
};

export default MenuItem;