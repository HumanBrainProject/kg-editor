import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import {  MenuItem } from "react-bootstrap";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Options from "./Options";
import NewValues from "./NewValues";
import OuterSpaceTypes from "./OuterSpaceTypes";

const styles = {
  container:{
    width:"100%",
    maxHeight:"33vh",
    overflowY:"auto",
    display:"block",
    position: "absolute",
    top: "100%",
    left: "0",
    zIndex: "1000",
    float: "left",
    minWidth: "160px",
    padding: "5px 0",
    margin: "2px 0 0",
    fontSize: "14px",
    textAlign: "left",
    backgroundColor: "#fff",
    backgroundClip: "padding-box",
    border: "1px solid rgba(0,0,0,.15)",
    borderRadius: "4px",
    boxShadow: "0 6px 12px rgba(0,0,0,.175)",
    "& .dropdown-menu":{
      position:"static",
      display:"block",
      float:"none",
      width:"100%",
      background:"none",
      border:"none",
      boxShadow:"none",
      padding:0,
      margin:0
    },
    "& .quickfire-dropdown-item .option": {
      position: "relative"
    },
    "& .quickfire-dropdown-item:hover $preview": {
      display: "block"
    }
  }
};

@injectStyles(styles)
class Dropdown extends React.Component {

  render() {
    const { types,
      outerSpaceTypes,
      currentType,
      currentOption,
      classes,
      hasMore,
      search,
      values,
      loading,
      onAddNewValue,
      onAddValue,
      onClose,
      onLoadMore,
      onPreview,
      onSelectNextType,
      onSelectPreviousType,
      onSelectNextValue,
      onSelectPreviousValue,
    } = this.props;

    return(
      <div className={`quickfire-dropdown ${classes.container}`} ref={ref=>{this.optionsRef = ref;}}>
        <InfiniteScroll
          element={"ul"}
          className={"dropdown-menu"}
          threshold={100}
          hasMore={hasMore}
          loadMore={onLoadMore}
          useWindow={false}>
          {!values.length && !types.length &&
            (<MenuItem key={"no-options"} className={"quickfire-dropdown-item"}>
              <em>No results found for: </em> <strong>{search}</strong>
            </MenuItem>)
          }
          <OuterSpaceTypes types={outerSpaceTypes} />
          <NewValues types={types} currentType={currentType} search={search} onSelectNext={onSelectNextType} onSelectPrevious={onSelectPreviousType} onSelect={onAddNewValue} onCancel={onClose}/>
          <Options values={values} current={currentOption} onSelectNext={onSelectNextValue} onSelectPrevious={onSelectPreviousValue} onSelect={onAddValue} onCancel={onClose} onPreview={onPreview} />
          {loading?
            <MenuItem className={"quickfire-dropdown-item quickfire-dropdown-item-loading"} key={"loading options"}>
              <div tabIndex={-1} className="option">
                <FontAwesomeIcon spin icon="circle-notch"/>
              </div>
            </MenuItem>
            :null}
        </InfiniteScroll>
      </div>

    );
  }
}

export default Dropdown;