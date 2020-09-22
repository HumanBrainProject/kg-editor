/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import { inject, observer } from "mobx-react";
import injectStyles from "react-jss";
import { FormGroup, Alert } from "react-bootstrap";
import { Column, Table } from "react-virtualized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";
import FieldLabel from "hbp-quickfire/lib/Components/FieldLabel";

import FieldError from "../FieldError";

import appStore from "../../Stores/AppStore";

import FetchingLoader from "../../Components/FetchingLoader";
import Dropdown from "../../Components/DynamicDropdown/Dropdown";

const styles = {
  container: {
    position: "relative"
  },
  field: {
    marginBottom: "0"
  },
  table: {
    border: "1px solid #ccc",
    paddingTop: "10px",
    marginBottom: "15px",
    "&.disabled": {
      background: "rgb(238, 238, 238)",
      color: "rgb(85,85,85)"
    },
    "& .ReactVirtualized__Table__headerTruncatedText": {
      textTransform:"initial",
      fontWeight:"600"
    },
    "& .form-control": {
      paddingLeft: "9px"
    }
  },
  headerRow:{
    borderBottom: "1px solid #e0e0e0"
  },
  evenRow: {
    borderBottom: "1px solid #e0e0e0"
  },
  oddRow: {
    borderBottom: "1px solid #e0e0e0"
  },
  activeRow: {
    cursor: "pointer",
    "&:hover":{
      color: "#143048",
      backgroundColor: "#a5c7e9"
    }
  },
  dropdownContainer:{
    height:"auto",
    borderRadius: "0",
    borderLeft: "0",
    borderRight: "0",
    borderBottom: "0",
    paddingTop: "4px",
    paddingBottom: "1px",
    position:"relative",
    "& input.quickfire-user-input":{
      width: "100%",
      maxWidth: "unset"
    }
  },
  emptyMessage: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.2em",
    fontWeight: "lighter",
    width:"100%",
    textAlign:"center"
  },
  emptyMessageLabel: {
    paddingLeft: "6px",
    display:"inline-block"
  },
  deleteBtn: {
    float: "right",
    marginRight: "9px"
  }
};

@inject("formStore")
@injectStyles(styles)
@observer
class DynamicTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      containerWidth: 0,
      scrollToIndex: -1
    };
  }

  componentDidMount() {
    this.setContainerWidth();
    window.addEventListener("resize", this.setContainerWidth);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.wrapperRef && (prevState.containerWidth !== this.wrapperRef.offsetWidth)) {
      this.setContainerWidth();
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.setContainerWidth);
  }

  //The only way to trigger an onChange event in React is to do the following
  //Basically changing the field value, bypassing the react setter and dispatching an "input"
  // event on a proper html input node
  //See for example the discussion here : https://stackoverflow.com/a/46012210/9429503
  triggerOnChange = () => {
    this.hiddenInputRef.value = "";
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
      .call(this.hiddenInputRef, JSON.stringify(this.props.field.getValue(false)));
    var event = new Event("input", { bubbles: true });
    this.hiddenInputRef.dispatchEvent(event);
  }

  handleDropdownReset = () => {
    appStore.togglePreviewInstance();
    this.props.field.resetOptionsSearch();
  }

  handleOnAddNewValue = (value, type) => {
    const {field, onAddCustomValue} = this.props;
    onAddCustomValue(value, type, field);
    field.resetOptionsSearch();
    this.triggerOnChange();
  }

  handleOnAddValue = id => {
    const {field} = this.props;
    const {mappingValue, mappingLabel} = field;
    field.addInstance(id, mappingValue, mappingLabel);
    field.addValue({[field.mappingValue]: id});
    field.resetOptionsSearch();
    this.triggerOnChange();
  }

  handleRemove(value, e){
    if(this.props.field.disabled || this.props.field.readOnly){
      return;
    }
    e.stopPropagation();
    this.beforeRemoveValue(value);
    this.triggerOnChange();
  }


  beforeRemoveValue(value){
    this.props.field.removeValue(value);
    appStore.togglePreviewInstance();
    this.props.field.resetOptionsSearch();
  }

  handleOptionPreview = (instanceId, instanceName) => {
    const options = { showEmptyFields:false, showAction:false, showBookmarkStatus:false, showType:true, showStatus:false };
    appStore.togglePreviewInstance(instanceId, instanceName, options);
  }

  handleSearchOptions = term => {
    this.props.field.searchOptions(term);
  }

  handleLoadMoreOptions = () => {
    this.props.field.loadMoreOptions();
  }

  setContainerWidth = () => {
    if(this.wrapperRef){
      this.setState({containerWidth: this.wrapperRef.offsetWidth});
    }
  }

  onRowClick = ({rowData}) => {
    const { field, onValueClick } = this.props;
    field.showInstance(rowData.id);
    typeof onValueClick === "function" &&
    setTimeout(() => onValueClick(field, {[field.mappingValue]: rowData.id}), 1000);
  }

  onRowMouseOver = ({index, rowData}) => {
    const { field, onValueMouseEnter } = this.props;
    field.isInstanceVisible(index, rowData.id) && typeof onValueMouseEnter === "function" && onValueMouseEnter(field, {[field.mappingValue]: rowData.id});
  }

  onRowMouseOut = ({index, rowData}) => {
    const { field, onValueMouseLeave } = this.props;
    field.isInstanceVisible(index, rowData.id) && typeof onValueMouseLeave === "function" && onValueMouseLeave(field, {[field.mappingValue]: rowData.id});
  }

  _rowClassName = ({index}) => {
    if (index < 0) {
      return this.props.classes.headerRow;
    } else {
      return `${index % 2 === 0 ? this.props.classes.evenRow : this.props.classes.oddRow} ${this.props.field.isInteractive?this.props.classes.activeRow:""}`;
    }
  }

  handleDelete = id => e => {
    const instance = this.props.field.instancesMap.get(id);
    this.handleRemove(instance, e);
    this.props.field.removeInstance(id);
  }

  handleDeleteAll = () => {
    this.props.field.removeAllInstancesAndValues();
    this.triggerOnChange();
  }

  handleRetry = id => e => {
    e.stopPropagation();
    this.props.field.fetchInstance(id);
  }

  lastCellRenderer = ({rowData}) => {
    const { formStore, field } = this.props;
    const { isInitialized, readMode, readOnly, disabled } = field;
    const { id, instance } = rowData;
    const { isFetched, fetchError } = instance;
    const isDisabled = formStore.readMode || readMode || readOnly || disabled;
    if (isInitialized && isFetched) {
      if (isDisabled) {
        return null;
      }
      return (
        <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDelete(id)} >
          <FontAwesomeIcon icon="times"/>
        </Button>
      );
    }
    if (id && fetchError) {
      return (
        <Button bsSize={"xsmall"} bsStyle={"danger"} onClick={this.handleRetry(id)} >
          <FontAwesomeIcon icon="redo-alt"/>
        </Button>
      );
    }
    return null;
  }

  firstCellRenderer = ({rowData, cellData}) => {
    const { field } = this.props;
    const { isInitialized } = field;
    const { id, instance } = rowData;
    const { isFetched, fetchError } = instance;
    if (fetchError) {
      if(id) {
        return fetchError;
      } else {
        return (
          <span style={{color: "var(--ft-color-error)"}}>
            <FontAwesomeIcon icon="exclamation-triangle"/>
            &nbsp; {fetchError}
          </span>
        );
      }

    }
    if (isFetched) {
      return cellData;
    }
    if (isInitialized) {
      return (
        <span>
          <FontAwesomeIcon icon="circle-notch" spin/>
          &nbsp; fetching {id}...
        </span>
      );
    }
    return id;
  }

  cellRenderer = index => {
    const { formStore, field } = this.props;
    const { columns, readMode, readOnly, disabled } = field;
    const isDisabled = formStore.readMode || readMode || readOnly || disabled;
    if(index === 0) {
      return this.firstCellRenderer;
    }
    if(index === columns.length-1 && !isDisabled) {
      return this.lastCellRenderer;
    }
    return undefined;
  }

  render() {
    const { classes, formStore, field } = this.props;
    const {
      instanceId,
      list,
      value: values,
      label,
      disabled,
      readOnly,
      readMode,
      max,
      allowCustomValues,
      validationErrors,
      validationState,
      optionsSearchTerm,
      options,
      optionsTypes,
      optionsExternalTypes,
      hasMoreOptions,
      fetchingOptions
    } = field;

    const fieldLabel = label.toLowerCase();
    const isDisabled = formStore.readMode || readMode || readOnly || disabled;
    const canAddValues =  !isDisabled && values.length < max;

    return (
      <FieldError id={instanceId} field={field}>
        <div className={classes.container} ref={ref=>this.wrapperRef = ref}>
          <div>
            <FormGroup
              onClick={this.handleFocus}
              className={`quickfire-field-dropdown-select ${!values.length? "quickfire-empty-field": ""}  ${disabled? "quickfire-field-disabled": ""} ${readOnly? "quickfire-field-readonly": ""} ${classes.field}`}
              validationState={validationState}>
              <FieldLabel field={field}/>
              {!isDisabled && (
                <div className={classes.deleteBtn}>
                  <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDeleteAll} disabled={list.length === 0}>
                    <FontAwesomeIcon icon="times"/>
                  </Button>
                </div>
              )}
              <div className={`${classes.table} ${((readOnly || disabled) && !(formStore.readMode || readMode))?"disabled":""}`}>
                <Table
                  width={this.state.containerWidth}
                  height={300}
                  headerHeight={20}
                  rowHeight={30}
                  rowClassName={this._rowClassName}
                  rowCount={list.length}
                  rowGetter={({ index }) => list[index]}
                  onRowClick={this.onRowClick}
                  onRowMouseOver={this.onRowMouseOver}
                  onRowMouseOut={this.onRowMouseOut}
                  rowRenderer={this.rowRenderer}
                  scrollToIndex={this.state.scrollToIndex-1}
                >
                  {field.columns.map((col,index) => {
                    const isLastCell = index === field.columns.length-1;
                    return(
                      <Column
                        label={col.label}
                        dataKey={col.name}
                        key={col.name}
                        flexGrow={isLastCell ? 0:1}
                        flexShrink={isLastCell ? 1:0}
                        width={20}
                        cellRenderer={this.cellRenderer(index)}
                      />
                    );}
                  )}
                </Table>
                {canAddValues && (
                  <div className={`form-control ${classes.dropdownContainer}`}>
                    <Dropdown
                      searchTerm={optionsSearchTerm}
                      options={options}
                      types={(allowCustomValues && optionsTypes.length && optionsSearchTerm)?optionsTypes:[]}
                      externalTypes={(allowCustomValues && optionsExternalTypes.length && optionsSearchTerm)?optionsExternalTypes:[]}
                      loading={fetchingOptions}
                      hasMore={hasMoreOptions}
                      inputPlaceholder={`type to add a ${fieldLabel}`}
                      onSearch={this.handleSearchOptions}
                      onLoadMore={this.handleLoadMoreOptions}
                      onReset={this.handleDropdownReset}
                      onAddValue={this.handleOnAddValue}
                      onAddNewValue={this.handleOnAddNewValue}
                      onPreview={this.handleOptionPreview}
                    />
                    <input style={{display:"none"}} type="text" ref={ref=>this.hiddenInputRef = ref}/>
                  </div>
                )}
              </div>
              {validationErrors && (
                <Alert bsStyle="danger">
                  {validationErrors.map(error => <p key={error}>{error}</p>)}
                </Alert>
              )}
              {!list.length && (
                <div className={classes.emptyMessage}>
                  <span className={classes.emptyMessageLabel}>
                    No {fieldLabel} available
                  </span>
                </div>
              )}
            </FormGroup>
          </div>
          {!field.isInitialized && list.length > 0 && (
            <FetchingLoader>
              <span>Fetching content...</span>
            </FetchingLoader>
          )}
        </div>
      </FieldError>
    );
  }
}

export default DynamicTable;