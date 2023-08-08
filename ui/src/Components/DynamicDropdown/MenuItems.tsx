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

import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { createUseStyles } from 'react-jss';

import MenuItem from './MenuItem';
import type { Suggestion } from '../../types';

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    '& > ul': {
      listStyleType: 'none',
      paddingLeft: 0,
      marginBottom: 0
    }
  },
  noResult: {
    padding: '10px'
  },
  loading: {
    padding: '0 10px 0 10px'
  }
});

interface MenuItemsProps {
  current: Suggestion|null;
  searchTerm: string;
  items: Suggestion[];
  loading: boolean;
  onSelect: (item: Suggestion) => void;
  onSelectPrevious: (item: Suggestion) => void;
  onSelectNext: (item: Suggestion) => void;
  onCancel: () => void;
}

const MenuItems = ({
  current,
  searchTerm,
  items,
  loading,
  onSelect,
  onSelectPrevious,
  onSelectNext,
  onCancel
}: MenuItemsProps) => {

  const classes = useStyles();

  if(!loading && !items.length) {
    return (
      <div className={classes.noResult}><em>No results found for: </em> <strong>{searchTerm}</strong></div>
    );
  }

  return(
    <div className={classes.container}>
      <ul>
        {items.map(item =>
          <MenuItem
            key={item.id}
            searchTerm={searchTerm}
            item={item}
            hasFocus={item === current}
            onSelectNext={onSelectNext}
            onSelectPrevious={onSelectPrevious}
            onSelect={onSelect}
            onCancel={onCancel}
          />
        )}
      </ul>
      {loading && (
        <div tabIndex={-1} className={classes.loading}>
          <FontAwesomeIcon spin icon={faCircleNotch}/>
        </div>
      )}
    </div>
  );
};

export default MenuItems;