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
import React, { useState, useEffect } from 'react';

import useStores from '../Hooks/useStores';

import Alternatives from './Alternatives';
import type Instance from '../Stores/Instance';
import type { Alternative } from '../types';
import type { RefObject } from 'react';

interface AlternativeValueProps {
  alternative: Alternative;
}

const AlternativeValue = observer(({alternative}: AlternativeValueProps) => alternative.value.map((instance: Instance) => instance.name).join('; '));
AlternativeValue.displayName = 'AlternativeValue';

interface LinksAlternativesProps {
  className: string;
  list: Alternative[];
  onSelect: (v: any) => void;
  onRemove: () => void;
  mappingValue: string;
  parentContainerRef: RefObject<HTMLInputElement>;
}

const LinksAlternatives = ({className, list, onSelect, onRemove, mappingValue, parentContainerRef}: LinksAlternativesProps) => {

  const { instanceStore } = useStores();

  const [items, setItems] = useState<Alternative[]>([]);

  useEffect(() => {
    setItems(list.map(({users, selected, value }) => {
      const instances = Array.isArray(value)?value.map(v => {
        if (v[mappingValue] && typeof v[mappingValue] === 'string') {
          const instance = instanceStore.createInstanceOrGet(v[mappingValue]);
          instance?.fetchLabel();
          return instance;
        }
        return {
          name: 'Unknown instance',
          value: value
        };
      }):[
        {
          name: JSON.stringify(value),
          value: value
        }
      ];
      return {
        users: users,
        selected: selected,
        value: instances
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  return (
    <Alternatives
      className={className}
      list={items}
      onSelect={onSelect}
      onRemove={onRemove}
      parentContainerRef={parentContainerRef}
      ValueRenderer={AlternativeValue}
    />
  );
};

export default LinksAlternatives;