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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { createUseStyles } from 'react-jss';

import User from '../Components/User';
import useStores from '../Hooks/useStores';

import type { ValueRendererProps } from './Alternatives';
import type { Alternative as AlternativeType } from '../types';
import type { MouseEvent, KeyboardEvent } from 'react';

const useStyles = createUseStyles({
  container: {
    '& .option em .user + .user:before': {
      content: '\'; \''
    },
    '& .option': {
      position: 'relative',
      paddingLeft: '3px'
    },
    '& .option .parenthesis': {
      display: 'inline-block',
      transform: 'scaleY(1.4)'
    },
    '& .selected': {
      position: 'absolute',
      top: '50%',
      left: '-15px',
      transform: 'translateY(-50%)'
    }
  },
  nullValue:{
    color: 'grey',
    fontStyle: 'italic'
  },
  removeIcon: {
    marginLeft: '3%'
  }
});


interface AlternativeProps {
  alternative: AlternativeType;
  ValueRenderer: React.ComponentType<ValueRendererProps>;
  className: string;
  hasFocus: boolean;
  onSelect: (v:any) => void;
  onSelectPrevious: (v: any) => void;
  onSelectNext: (v: any) => void;
  onCancel: () => void;
  onRemove: (e: MouseEvent<SVGSVGElement>) => void;
}

const Alternative = ({ alternative, ValueRenderer, className, hasFocus, onSelect, onSelectPrevious, onSelectNext, onCancel, onRemove }: AlternativeProps) => {

  const { userProfileStore } = useStores();

  const classes = useStyles();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFocus) {
      ref.current?.focus();
    }
  });

  const handleSelect = () => {
    typeof onSelect === 'function' && onSelect(alternative.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if(e) {
      switch(e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        onSelectPrevious(alternative.value);
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        onSelectNext(alternative.value);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        onSelect(alternative.value);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onCancel();
        break;
      }
      default:
        break;
      }
    }
  };

  const handleRemoveClick = (e: MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    typeof onRemove === 'function' && onRemove(e);
  };

  const users = (!alternative || !alternative.users)?[]:alternative.users;
  const isOwnAlternative = users.find(user => userProfileStore.user?.id === user.id);
  return (
    <Dropdown.Item className={classes.container} onClick={handleSelect}>
      <div tabIndex={-1} className={`option ${className?className:''}`} onKeyDown={handleKeyDown} ref={ref} >
        {alternative.value !== null ? <strong>
          <ValueRenderer alternative={alternative} />
        </strong> : <span className={classes.nullValue}>no value</span>} <em><div className="parenthesis">(</div>{
          users.map(user => (
            <User key={user.id} userId={user.id} name={user.name} picture={user.picture} />
          ))
        }<div className="parenthesis">)</div></em>
        {alternative.selected?
          <FontAwesomeIcon icon="check" className="selected" />
          :null
        }
        {isOwnAlternative && (
          <span className={classes.removeIcon}><FontAwesomeIcon onClick={handleRemoveClick} icon="times" /></span>
        )}
      </div>
    </Dropdown.Item>
  );
};

export default Alternative;
