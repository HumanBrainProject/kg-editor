import React, { useEffect, useState } from "react";
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

const Dropdown = ({ options, types, externalTypes, inputPlaceholder, loading, hasMore, searchTerm, onSearch, onReset, onAddValue, onAddNewValue, onDeleteLastValue, onLoadMore, onDrop, onPreview }) => {

  const classes = useStyles();

  const [current, setCurrent] = useState({ type: null, option: null});

  useEffect(() => {
    return () => {
      unlistenClickOutHandler();
    };
  }, []);

  const handleInputKeyStrokes = e => {
    if(e.keyCode === 8 && !e.target.value){
      e.preventDefault();
      onDeleteLastValue && onDeleteLastValue();
    } else if(e.keyCode === 40){
      e.preventDefault();
      if(types.length){
        const type = types[0];
        setCurrent({type: type.name, option: null});
      } else if(options.length){
        const value = options[0];
        setCurrent({type: null, option: value.id});
      } else if(types.length) {
        const type = types[types.length-1];
        setCurrent({type: type.name, option: null});
      } else {
        setCurrent({type: null, option: null});
      }
    } else if(e.keyCode === 38){
      e.preventDefault();
      if(options.length){
        const value = options[options.length - 1];
        setCurrent({type: null, option: value.id});
      } else if(types.length){
        const type = types[options.length-1];
        setCurrent({type: type.name, option: null});
      } else if(options.length){
        const value = options[0];
        setCurrent({type: null, option: value.id});
      } else {
        setCurrent({type: null, option: null});
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
      setCurrent({type: null, option: null});
      handleFocus();
    }
  };

  const handleOnAddValue = id => {
    onAddValue(id);
    setCurrent({type: null, option: null});
    handleFocus();
  };

  const handleOnSelectNextType = name => {
    const index = types.findIndex(o => o.name === name);
    if(index < types.length - 1){
      const type = types[index + 1] ;
      setCurrent({type: type.name, option: null});
    } else if(options.length){
      const value = options[0];
      setCurrent({type: null, option: value.id});
    } else if(types.length) {
      const type = types[0];
      setCurrent({type: type.name, option: null});
    } else {
      setCurrent({type: null, option: null});
    }
  };

  const handleOnSelectPreviousType = name => {
    const index = types.findIndex(o => o.name === name);
    if(index > 0){
      const type = types[index - 1] ;
      setCurrent({type: type.name, option: null});
    } else if(options.length){
      const value = options[options.length-1];
      setCurrent({type: null, option: value.id});
    } else if(types.length) {
      const type = types[0];
      setCurrent({type: type.name, option:null});
    } else {
      setCurrent({type: null, option: null});
    }
  };

  const handleOnSelectNextValue = id => {
    const index = options.findIndex(o => o.id === id);
    if(index < options.length - 1){
      const value = options[index + 1] ;
      setCurrent({type:null, option: value.id});
    } else if(types.length) {
      const type = types[0];
      setCurrent({type: type.name, option: null});
    } else if(options.length) {
      const value = options[0];
      setCurrent({type: null, option: value.id});
    } else {
      setCurrent({type: null, option: null});
    }
  };

  const handleOnSelectPreviousValue = id => {
    const index = options.findIndex(o => o.id === id);
    if(index > 0){
      const value = options[index- 1] ;
      setCurrent({type: null, option: value.id});
    } else if(types.length){
      const type = types[types.length-1];
      setCurrent({type: type.name, option: null});
    } else if(options.length){
      const value = options[0];
      setCurrent({type: null, option: value.id});
    } else {
      setCurrent({type: null, option: null});
    }
  };

  const handleReset = () => {
    setCurrent({type: null, option: null});
    onReset();
  };

  const handleFocus = () => {
    onSearch("");
    listenClickOutHandler();
  };

  const clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
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

  const showMenu = this.wrapperRef && this.wrapperRef.contains(document.activeElement) && (options.length || searchTerm);

  return (
    <div className={classes.container} ref={ref=>this.wrapperRef = ref}>
      <input className={`quickfire-user-input ${classes.userInput}`}
        onDrop={e => e.preventDefault() && onDrop && onDrop()}
        onDragOver={e => e.preventDefault()}
        ref={ref => this.inputRef = ref}
        type="text"
        onKeyDown={handleInputKeyStrokes}
        onChange={handleChangeUserInput}
        onFocus={handleFocus}
        value={searchTerm}
        placeholder={inputPlaceholder} />
      {showMenu && (
        <Menu type={current.type}
          option={current.option}
          searchTerm={searchTerm}
          values={options}
          types={types}
          externalTypes={externalTypes}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onAddNewValue={handleOnAddNewValue}
          onAddValue={handleOnAddValue}
          onSelectNextType={handleOnSelectNextType}
          onSelectPreviousType={handleOnSelectPreviousType}
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