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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Column, Table as TableComponent } from "react-virtualized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";

import instancesStore from "../../Stores/InstancesStore";

const styles = {
  container: {
    position: "relative",
    " .ReactVirtualized__Table__headerTruncatedText": {
      textTransform:"initial",
      fontWeight:"600"
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
  }
};

@observer
class LabelCellRenderer extends React.Component {

  componentDidMount() {
    this.fetchInstance();
  }

  componentDidUpdate(previousProps) {
    if (previousProps.instanceId !== this.props.instanceId) {
      this.fetchInstance();
    }
  }

  fetchInstance = () => {
    const { instanceId } = this.props;
    instanceId && instancesStore.createInstanceOrGet(instanceId).fetchLabel();
  };

  render() {
    const {instanceId} = this.props;

    const instance = instanceId && instancesStore.instances.get(instanceId);

    if (!instance) {
      return "Unknown instance";
    }
    if (instance.fetchError || instance.labelFetchError) {
      return (
        <span style={{color: "var(--ft-color-error)"}}>
          <FontAwesomeIcon icon="exclamation-triangle"/>
          &nbsp; {instance.fetchError || instance.labelFetchError}
        </span>
      );
    }
    if (instance.isFetched || instance.isLabelFetched) {
      return instance.name;
    }
    if (instance.isFetching || instance.isLabelFetching) {
      return (
        <span>
          <FontAwesomeIcon icon="circle-notch" spin/>
          &nbsp; fetching {instance.id}...
        </span>
      );
    }
    return instanceId;
  }
}

@observer
class ActionsCellRenderer extends React.Component {

  handleRetry = e => {
    e.stopPropagation();
    const { instanceId, onRetry } = this.props;
    onRetry(instanceId);
  }

  handleDelete = e => {
    e.stopPropagation();
    const { index, onDeleteRow} = this.props;
    onDeleteRow(index);
  }

  render() {
    const {instanceId, readOnly} = this.props;
    if (readOnly) {
      return null;
    }

    const instance = instanceId && instancesStore.instances.get(instanceId);

    if (instance && instance.fetchError) {
      return (
        <Button bsSize={"xsmall"} bsStyle={"danger"} onClick={this.handleRetry} >
          <FontAwesomeIcon icon="redo-alt"/>
        </Button>
      );
    }
    if (!instance || instance.isFetched || instance.isLabelFetched) {
      return (
        <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDelete} >
          <FontAwesomeIcon icon="times"/>
        </Button>
      );
    }
    return null;
  }
}

@injectStyles(styles)
@observer
class Table extends React.Component {
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

  componentDidUpdate(previousProps, previousState) {
    if(this.wrapperRef && (previousState.containerWidth !== this.wrapperRef.offsetWidth)) {
      this.setContainerWidth();
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.setContainerWidth);
  }

  handleDeleteRow = index => this.props.onRowDelete(index);

  handleRetry = id => this.props.field.fetchInstance(id);

  handleRowClick = ({index}) => typeof this.props.onRowMouseOver === "function" && this.props.onRowClick(index);

  handleRowMouseOver = ({index}) => typeof this.props.onRowMouseOver === "function" && this.props.onRowMouseOver(index);

  handleRowMouseOut = ({index}) => typeof this.props.onRowMouseOut === "function" && this.props.onRowMouseOut(index);

  setContainerWidth = () => {
    if(this.wrapperRef){
      this.setState({containerWidth: this.wrapperRef.offsetWidth});
    }
  }

  rowClassName = ({index}) => {
    const { classes, enablePointerEvents } = this.props;
    if (index < 0) {
      return classes.headerRow;
    } else {
      return `${index % 2 === 0 ? classes.evenRow : classes.oddRow} ${enablePointerEvents?classes.activeRow:""}`;
    }
  }

  rowGetter = ({index}) => this.props.list[index];

  actionsCellRenderer = ({rowData: instanceId, rowIndex}) => (
    <ActionsCellRenderer
      instanceId={instanceId}
      index={rowIndex}
      readOnly={this.props.readOnly}
      onRetry={this.handleRetry}
      onDeleteRow={this.handleDeleteRow}
    />
  );

  labelCellRenderer = ({rowData: instanceId}) => <LabelCellRenderer instanceId={instanceId} />;

  render() {
    const { classes, list, enablePointerEvents } = this.props;

    return (
      <div className={classes.container} ref={ref=>this.wrapperRef = ref}>
        <TableComponent
          width={this.state.containerWidth}
          height={300}
          headerHeight={20}
          rowHeight={30}
          rowClassName={this.rowClassName}
          rowCount={list.length}
          rowGetter={this.rowGetter}
          onRowClick={enablePointerEvents?this.handleRowClick:null}
          onRowMouseOver={enablePointerEvents?this.handleRowMouseOver:null}
          onRowMouseOut={enablePointerEvents?this.handleRowMouseOut:null}
          rowRenderer={this.rowRenderer}
          scrollToIndex={this.state.scrollToIndex-1}
        >
          <Column
            label="Name"
            dataKey="name"
            flexGrow={1}
            flexShrink={0}
            width={20}
            cellRenderer={this.labelCellRenderer}
          />
          <Column
            label={""}
            dataKey="Actions"
            flexGrow={0}
            flexShrink={1}
            width={20}
            cellRenderer={this.actionsCellRenderer}
          />
        </TableComponent>
      </div>
    );
  }
}

export default Table;