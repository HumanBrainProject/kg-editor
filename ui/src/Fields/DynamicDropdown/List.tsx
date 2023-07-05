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

import React from 'react';

import ListItem from './ListItem';
import type { Value } from '../Stores/LinksStore';
import type { KeyboardEvent } from 'react';

interface ListProps {
  list: string[];
  readOnly: boolean;
  disabled: boolean;
  enablePointerEvents: boolean;
  onClick?: (index: number) => void;
  onDelete?: (index: number) => void;
  onDragEnd?: () => void;
  onDragStart?: (index: number) => void;
  onDrop?: (droppedIndex: number) => void;
  onKeyDown?: (value: Value, e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: (index: number) => void;
  onBlur?: () => void;
  fetchLabel: boolean;
  mainInstanceId?: string;
}

const List = ({
  list,
  readOnly,
  disabled,
  enablePointerEvents,
  onClick,
  onDelete,
  onDragEnd,
  onDragStart,
  onDrop,
  onKeyDown,
  onFocus,
  onBlur,
  fetchLabel,
  mainInstanceId
}: ListProps) => (
  <span>
    {list.map((id, index) => (
      <ListItem
        key={`${index}-${id}`}
        index={index}
        instanceId={id}
        readOnly={readOnly}
        isCircular={mainInstanceId === id}
        disabled={disabled}
        enablePointerEvents={enablePointerEvents}
        onClick={onClick}
        onDelete={onDelete}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        fetchLabel={fetchLabel}
      />
    ))}
  </span>
);

export default List;