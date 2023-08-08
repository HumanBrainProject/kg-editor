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

import {faCircle} from '@fortawesome/free-solid-svg-icons/faCircle';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';

import GridSelector from '../../Components/GridSelector';
import useStores from '../../Hooks/useStores';
import type { StructureOfType } from '../../types';


const useStyles = createUseStyles({
  type: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: '8px',
    fontSize: '1.1em',
    fontWeight: '300',
    wordBreak: 'break-word'
  },
  icon: {
    alignSelf: 'center'
  },
  infoCircle: {
    marginLeft: '5px',
    transform: 'translateY(2px)'
  }
});

const TypeComponent = ({ item: type }: { item: StructureOfType }) => {

  const classes = useStyles();

  return (
    <div className={classes.type} title={type.description??type.name}>
      <div className={classes.icon} style={type.color ? { color: type.color } : {}} >
        <FontAwesomeIcon fixedWidth icon={faCircle} />
      </div>
      <span>
        {type.label}
        {!!type.description && (
          <FontAwesomeIcon className={classes.infoCircle} icon={faInfoCircle} />
        )}
      </span>
    </div>
  );
};

interface TypeSelectionProps {
  onSelect: (type: StructureOfType) => void;
}

const TypeSelection = observer(({ onSelect }: TypeSelectionProps) => {

  const { typeStore, appStore } = useStores();

  const list = appStore.currentSpacePermissions.canCreate?typeStore.canCreateTypes:[] as StructureOfType[];

  const handleFilter = (list: StructureOfType[], term: string) => list.filter(type => type.label.toLowerCase().includes(term));

  const Component = GridSelector<StructureOfType>;

  return (
    <Component list={list} itemComponent={TypeComponent} getKey={type => type.name} onSelect={onSelect} onFilter={handleFilter} filterPlaceholder="Filter types" />
  );
});
TypeSelection.displayName = 'TypeSelection';

export default TypeSelection;
