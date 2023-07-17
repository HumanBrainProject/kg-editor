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

import React, { useEffect, useState, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import Menu from './Menu';
import type { Suggestion } from '../../types';
import type { DragEvent, KeyboardEvent, ChangeEvent, RefObject } from 'react';

const useStyles = createUseStyles({
  container: {
    display: 'inline'
  },
  userInput:{
    background:'transparent',
    border:'none',
    color:'currentColor',
    outline:'none',
    width:'200px',
    maxWidth:'33%',
    marginBottom:'3px'
  }
});

interface DropdownProps {
  className?: string;
  inputRef: RefObject<HTMLInputElement>;
  options: Suggestion[];
  inputPlaceholder?: string;
  loading: boolean;
  hasMore: boolean;
  searchTerm: string;
  onSearch: (v: string) => void;
  onReset: () => void;
  onSelect: (option: Suggestion) => void;
  onDeleteLastValue?: () => void;
  onLoadMore: () => void;
  onDrop?: () => void;
}

const Dropdown = ({ className, inputRef, options, inputPlaceholder, loading, hasMore, searchTerm, onSearch, onReset, onSelect, onDeleteLastValue, onLoadMore, onDrop }: DropdownProps) => {

  const classes = useStyles();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState<Suggestion|null>(null);

  useEffect(() =>
    () => { // Unmount
      unlistenClickOutHandler();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);

  const handleInputKeyStrokes = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Backspace' && !e.currentTarget.value){
      e.preventDefault();
      onDeleteLastValue && onDeleteLastValue();
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(options.length){
        const option = options[0];
        setCurrent(option);
      } else {
        setCurrent(null);
      }
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(options.length){
        const option = options[options.length - 1];
        setCurrent(option);
      } else {
        setCurrent(null);
      }
    } else if(e.key === 'Escape') {
      //escape key -> we want to reset the search
      handleReset();
    }
  };

  const handleChangeUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSearch(e.target.value);
  };

  const handleOnSelect = (item: Suggestion) => {
    setCurrent(null);
    handleFocus();
    onSelect(item);
  };

  const handleOnSelectNext = (item: Suggestion) => {
    const index = options.findIndex(o => o === item);
    if(index < options.length - 1){
      const option = options[index + 1] ;
      setCurrent(option);
    } else if(options.length) {
      const option = options[0];
      setCurrent(option);
    } else {
      setCurrent(null);
    }
  };

  const handleOnSelectPrevious = (item: Suggestion) => {
    const index = options.findIndex(o => o === item);
    if(index > 0){
      const option = options[index- 1] ;
      setCurrent(option);
    } else if(options.length){
      const option = options[options.length-1];
      setCurrent(option);
    } else {
      setCurrent(null);
    }
  };

  const handleReset = () => {
    setCurrent(null);
    onReset();
  };

  const handleFocus = () => {
    onSearch('');
    setCurrent(null);
    listenClickOutHandler();
  };

  const handleOnDrop = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    onDrop && onDrop();
  };

  const clickOutHandler = (e: MouseEvent | Event) => {
    if(wrapperRef.current && !wrapperRef.current.contains(e.target as Node)){
      unlistenClickOutHandler();
      handleReset();
    }
  };

  const listenClickOutHandler = () => {
    window.addEventListener('mouseup', clickOutHandler, false);
    window.addEventListener('touchend', clickOutHandler, false);
    window.addEventListener('keyup', clickOutHandler, false);
  };

  const unlistenClickOutHandler = () => {
    window.removeEventListener('mouseup', clickOutHandler, false);
    window.removeEventListener('touchend', clickOutHandler, false);
    window.removeEventListener('keyup', clickOutHandler, false);
  };

  const showMenu = options.length || searchTerm || loading;

  return (
    <div className={`${classes.container} ${className?className:''}`} ref={wrapperRef}>
      <input className={classes.userInput}
        ref={inputRef}
        onDrop={handleOnDrop}
        onDragOver={e => e.preventDefault()}
        type="text"
        onKeyDown={handleInputKeyStrokes}
        onChange={handleChangeUserInput}
        onFocus={handleFocus}
        value={searchTerm}
        placeholder={inputPlaceholder} />
      {showMenu && (
        <Menu
          current={current}
          searchTerm={searchTerm}
          items={options}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onSelect={handleOnSelect}
          onSelectNext={handleOnSelectNext}
          onSelectPrevious={handleOnSelectPrevious}
          onCancel={handleReset}
        />
      )}
    </div>
  );
};

export default Dropdown;