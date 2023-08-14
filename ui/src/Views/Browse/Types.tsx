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

import { observer } from 'mobx-react-lite';
import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { createUseStyles } from 'react-jss';
import Filter from '../../Components/Filter';
import useStores from '../../Hooks/useStores';
import AvaiableTypes from './AvailableTypes';
import TypesItem from './TypesItem';

const useStyles = createUseStyles({
  container: {
    background: 'var(--bg-color-ui-contrast2)',
    borderRight: '1px solid var(--border-color-ui-contrast1)',
    color: 'var(--ft-color-loud)',
    position: 'relative',
    display: 'grid',
    gridTemplateRows:'auto auto 1fr'
  },
  header: {
    color: 'var(--ft-color-quiet)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '0.9em',
    padding: '10px 10px 0 10px',
    cursor: 'pointer'
  },
  filter: {
    position: 'relative'
  },
  noMatch: {
    padding: '0 15px'
  }
});


const Types = observer(() => {

  const classes = useStyles();

  const { typeStore, browseStore } = useStores();

  const typeList = typeStore.filterTypes(browseStore.navigationFilter);

  const handleFilterChange = (value: string) => browseStore.setNavigationFilterTerm(value);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        Types
        <AvaiableTypes />
      </div>
      <div className={classes.filter}>
        <Filter value={browseStore.navigationFilter} placeholder="Filter types" onChange={handleFilterChange} />
      </div>
      <Scrollbars autoHide>
        {browseStore.navigationFilter.trim() && typeList.length === 0 && (
          <em className={classes.noMatch}>No matches found</em>
        )}
        {typeList.map((type) => <TypesItem key={type.name} type={type} />)}
      </Scrollbars>
    </div>
  );
});
Types.displayName = 'Types';

export default Types;
