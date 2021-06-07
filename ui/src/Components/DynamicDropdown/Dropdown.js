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

import React, { useEffect, useState, useRef } from "react";
import { createUseStyles } from "react-jss";
import Menu from "./Menu";

const useStyles = createUseStyles({
  container: {
    display: "inline"
  },
  userInput:{
    background:"transparent",
    border:"none",
    color:"currentColor",
    outline:"none",
    width:"200px",
    maxWidth:"33%",
    marginBottom:"3px"
  }
});

const Dropdown = ({ className, options, newOptions, inputPlaceholder, loading, hasMore, searchTerm, onSearch, onReset, onAddValue, onExternalCreate, onAddNewValue, onDeleteLastValue, onLoadMore, onDrop, onPreview, onSelectTargetType }) => {

  const classes = useStyles();

  const wrapperRef = useRef();

  const [current, setCurrent] = useState({ newOption: null, option: null});

  useEffect(() => {
    return () => { // Unmount
      unlistenClickOutHandler();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputKeyStrokes = e => {
    if(e.keyCode === 8 && !e.target.value){
      e.preventDefault();
      onDeleteLastValue && onDeleteLastValue();
    } else if(e.keyCode === 40){ //down
      e.preventDefault();
      if(newOptions.length){
        const newOption = newOptions[0];
        setCurrent({newOption: newOption.id, option: null});
      } else if(options.length){
        const value = options[0];
        setCurrent({newOption: null, option: value.id});
      } else {
        setCurrent({newOption: null, option: null});
      }
    } else if(e.keyCode === 38){ //up
      e.preventDefault();
      if(options.length){
        const value = options[options.length - 1];
        setCurrent({newOption: null, option: value.id});
      } else {
        setCurrent({newOption: null, option: null});
      }
    } else if(e.keyCode === 27) {
      //escape key -> we want to reset the search
      handleReset();
    }
  };

  const handleChangeUserInput = e => {
    e.stopPropagation();
    onSearch(e.target.value);
  };

  const handleOnAddNewValue = type => {
    const name = searchTerm.trim();
    if(name) {
      onAddNewValue(name, type);
      setCurrent({newOption: null, option: null});
      handleFocus();
    }
  };

  const handleOnAddValue = id => {
    onAddValue(id);
    setCurrent({newOption: null, option: null});
    handleFocus();
  };

  const handleOnSelectNextNewOption = name => {
    const index = newOptions.findIndex(o => o.name === name);
    if(index < newOptions.length - 1){
      const newOption = newOptions[index + 1] ;
      setCurrent({newOption: newOption.id, option: null});
    } else if(options.length){
      const value = options[0];
      setCurrent({newOption: null, option: value.id});
    } else if(newOptions.length) {
      const newOption = newOptions[0];
      setCurrent({newOption: newOption.id, option: null});
    } else {
      setCurrent({newOption: null, option: null});
    }
  };

  const handleOnSelectPreviousNewOption = name => {
    const index = newOptions.findIndex(o => o.name === name);
    if(index > 0){
      const newOption = newOptions[index - 1] ;
      setCurrent({newOption: newOption.id, option: null});
    } else if(options.length){
      const value = options[options.length-1];
      setCurrent({newOption: null, option: value.id});
    } else if(newOptions.length) {
      const newOption = newOptions[0];
      setCurrent({newOption: newOption.id, option:null});
    } else {
      setCurrent({newOption: null, option: null});
    }
  };

  const handleOnSelectNextValue = id => {
    const index = options.findIndex(o => o.id === id);
    if(index < options.length - 1){
      const value = options[index + 1] ;
      setCurrent({newOption:null, option: value.id});
    } else if(newOptions.length) {
      const newOption = newOptions[0];
      setCurrent({newOption: newOption.id, option: null});
    } else if(options.length) {
      const value = options[0];
      setCurrent({newOption: null, option: value.id});
    } else {
      setCurrent({newOption: null, option: null});
    }
  };

  const handleOnSelectPreviousValue = id => {
    const index = options.findIndex(o => o.id === id);
    if(index > 0){
      const value = options[index- 1] ;
      setCurrent({newOption: null, option: value.id});
    } else if(newOptions.length){
      const newOption = newOptions[newOptions.length-1];
      setCurrent({newOption: newOption.id, option: null});
    } else if(options.length){
      const value = options[0];
      setCurrent({newOption: null, option: value.id});
    } else {
      setCurrent({newOption: null, option: null});
    }
  };

  const handleReset = () => {
    setCurrent({newOption: null, option: null});
    onReset();
  };

  const handleFocus = () => {
    onSearch("");
    setCurrent({newOption: null, option: null});
    listenClickOutHandler();
  };

  const clickOutHandler = e => {
    if(wrapperRef.current && !wrapperRef.current.contains(e.target)){
      unlistenClickOutHandler();
      handleReset();
    }
  };

  const listenClickOutHandler = () => {
    window.addEventListener("mouseup", clickOutHandler, false);
    window.addEventListener("touchend", clickOutHandler, false);
    window.addEventListener("keyup", clickOutHandler, false);
  };

  const unlistenClickOutHandler = () => {
    window.removeEventListener("mouseup", clickOutHandler, false);
    window.removeEventListener("touchend", clickOutHandler, false);
    window.removeEventListener("keyup", clickOutHandler, false);
  };

  //const showMenu = wrapperRef.current && wrapperRef.current.contains(document.activeElement) && (options.length || searchTerm);
  const showMenu = options.length || searchTerm;

  return (
    <div className={`${classes.container} ${className?className:""}`} ref={wrapperRef}>
      <input className={classes.userInput}
        onDrop={e => e.preventDefault() && onDrop && onDrop()}
        onDragOver={e => e.preventDefault()}
        type="text"
        onKeyDown={handleInputKeyStrokes}
        onChange={handleChangeUserInput}
        onFocus={handleFocus}
        value={searchTerm}
        placeholder={inputPlaceholder} />
      {showMenu && (
        <Menu 
          currentNewOption={current.newOption}
          currentOption={current.option}
          searchTerm={searchTerm}
          values={options}
          newValues={newOptions}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onAddNewValue={handleOnAddNewValue}
          onAddValue={handleOnAddValue}
          onExternalCreate={onExternalCreate}
          onSelectNextType={handleOnSelectNextNewOption}
          onSelectPreviousType={handleOnSelectPreviousNewOption}
          onSelectNextValue={handleOnSelectNextValue}
          onSelectPreviousValue={handleOnSelectPreviousValue}
          onCancel={handleReset}
          onPreview={onPreview}
        />
      )}
    </div>
  );
};

export default Dropdown;