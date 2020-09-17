import React from "react";
import injectStyles from "react-jss";
import Menu from "./Menu";

const styles = {
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
};

@injectStyles(styles)
class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentType: null,
      currentOption: null
    };
  }

  handleInputKeyStrokes = e => {
    const { options, types, disabled, onDeleteLastValue} = this.props;
    if(disabled){
      return;
    }
    if(e.keyCode === 8 && !e.target.value){
      e.preventDefault();
      onDeleteLastValue();
    } else if(e.keyCode === 40){
      e.preventDefault();
      if(types.length){
        const type = types[0];
        this.setState({currentType: type.name, currentOption: null});
      } else if(options.length){
        const value = options[0];
        this.setState({currentType: null, currentOption: value.id});
      } else if(types.length) {
        const type = types[types.length-1];
        this.setState({currentType: type.name, currentOption: null});
      } else {
        this.setState({currentType: null, currentOption: null});
      }
    } else if(e.keyCode === 38){
      e.preventDefault();
      if(options.length){
        const value = options[options.length - 1];
        this.setState({currentType: null, currentOption: value.id});
      } else if(types.length){
        const type = types[options.length-1];
        this.setState({currentType: type.name, currentOption: null});
      } else if(options.length){
        const value = options[0];
        this.setState({currentType: null, currentOption: value.id});
      } else {
        this.setState({currentType: null, currentOption: null});
      }
    } else if(e.keyCode === 27) {
      //escape key -> we want to reset the search
      this.handleReset();
    }
  };

  handleChangeUserInput = e => {
    const { onSearch } = this.props;
    e.stopPropagation();
    onSearch(e.target.value);
  }

  handleOnAddNewValue = type => {
    const { searchTerm } = this.props;
    const { onAddNewValue } = this.props;
    const name = searchTerm.trim();
    if(name) {
      onAddNewValue(name, type);
      this.setState({currentType: null, currentOption: null});
      this.handleFocus();
    }
  }

  handleOnAddValue = id => {
    const { onAddValue } = this.props;
    onAddValue(id);
    this.setState({currentType: null, currentOption: null});
    this.handleFocus();
  }

  handleOnSelectNextType = name => {
    const { types, options } = this.props;
    const index = types.findIndex(o => o.name === name);
    if(index < types.length - 1){
      const type = types[index + 1] ;
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else if(types.length) {
      const type = types[0];
      this.setState({currentType: type.name, currentOption: null});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectPreviousType = name => {
    const { types, options } = this.props;
    const index = types.findIndex(o => o.name === name);
    if(index > 0){
      const type = types[index - 1] ;
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[options.length-1];
      this.setState({currentType: null, currentOption: value.id});
    } else if(types.length) {
      const type = types[0];
      this.setState({currentType: type.name, currentOption:null});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectNextValue = id => {
    const { types, options } = this.props;
    const index = options.findIndex(o => o.id === id);
    if(index < options.length - 1){
      const value = options[index + 1] ;
      this.setState({currentType:null, currentOption: value.id});
    } else if(types.length) {
      const type = types[0];
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length) {
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleOnSelectPreviousValue = id => {
    const { types, options } = this.props;
    const index = options.findIndex(o => o.id === id);
    if(index > 0){
      const value = options[index- 1] ;
      this.setState({currentType: null, currentOption: value.id});
    } else if(types.length){
      const type = types[types.length-1];
      this.setState({currentType: type.name, currentOption: null});
    } else if(options.length){
      const value = options[0];
      this.setState({currentType: null, currentOption: value.id});
    } else {
      this.setState({currentType: null, currentOption: null});
    }
  }

  handleReset = () => {
    const { onReset } = this.props;
    this.setState({currentType: null, currentOption: null});
    onReset();
  }

  handleFocus = () => {
    const { searchTerm, disabled, onSearch } = this.props;
    if (!disabled) {
      onSearch(searchTerm);
      this.listenClickOutHandler();
    }
  };

  clickOutHandler = e => {
    if(!this.wrapperRef || !this.wrapperRef.contains(e.target)){
      this.unlistenClickOutHandler();
      this.handleReset();
    }
  };

  listenClickOutHandler(){
    window.addEventListener("mouseup", this.clickOutHandler, false);
    window.addEventListener("touchend", this.clickOutHandler, false);
    window.addEventListener("keyup", this.clickOutHandler, false);
  }

  unlistenClickOutHandler(){
    window.removeEventListener("mouseup", this.clickOutHandler, false);
    window.removeEventListener("touchend", this.clickOutHandler, false);
    window.removeEventListener("keyup", this.clickOutHandler, false);
  }

  componentWillUnmount(){
    this.unlistenClickOutHandler();
  }

  render() {
    const { classes, className, searchTerm, options, types, externalTypes, disabled, loading, hasMore, onLoadMore, onDrop, onPreview } = this.props;

    const showMenu = !disabled && this.wrapperRef && this.wrapperRef.contains(document.activeElement) && (options.length || searchTerm);

    return (
      <div className={`${classes.container} kg-dropdown ${className?className:""}`} ref={ref=>this.wrapperRef = ref}>
        <input className={`quickfire-user-input ${classes.userInput}`}
          onDrop={e => e.preventDefault() && onDrop}
          onDragOver={e => e.preventDefault()}
          ref={ref => this.inputRef = ref} type="text"
          onKeyDown={this.handleInputKeyStrokes}
          onChange={this.handleChangeUserInput}
          onFocus={this.handleFocus}
          value={searchTerm}
          disabled={disabled} />
        {showMenu ?
          <Menu currentType={this.state.currentType}
            currentOption={this.state.currentOption}
            searchTerm={searchTerm}
            values={options}
            types={types}
            externalTypes={externalTypes}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onAddNewValue={this.handleOnAddNewValue}
            onAddValue={this.handleOnAddValue}
            onSelectNextType={this.handleOnSelectNextType}
            onSelectPreviousType={this.handleOnSelectPreviousType}
            onSelectNextValue={this.handleOnSelectNextValue}
            onSelectPreviousValue={this.handleOnSelectPreviousValue}
            onCancel={this.handleReset}
            onPreview={onPreview}
          />
          : null}
      </div>
    );
  }
}

export default Dropdown;