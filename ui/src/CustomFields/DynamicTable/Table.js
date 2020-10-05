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

import instanceStore from "../../Stores/InstanceStore";

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
  render() {
    const {instance} = this.props;
    if (!instance.id) {
      return "Unknown instance";
    }
    if (instance.fetchError || instance.labelFetchError) {
      return (
        <span style={{color: "var(--ft-color-error)"}}>
          <FontAwesomeIcon icon="exclamation-triangle"/>
          &nbsp; {instance.fetchError}
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
    return instance.id;
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
    this.fetchInstances();
  }

  componentDidUpdate(previousProps, previousState) {
    if(this.wrapperRef && (previousState.containerWidth !== this.wrapperRef.offsetWidth)) {
      this.setContainerWidth();
    }
    if (previousProps.list !== this.props.list) {
      this.fetchInstances();
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.setContainerWidth);
  }

  fetchInstances = () => {
    const { list } = this.props;
    list.forEach(id => id && instanceStore.createInstanceOrGet(id).fetchLabel());
  };

  handleDeleteRow = index => e => {
    e.stopPropagation();
    this.props.onRowDelete(index);
  }

  handleRetry = id => e => {
    e.stopPropagation();
    this.props.field.fetchInstance(id);
  }

  handleRowClick = ({index}) => {
    typeof this.props.onRowMouseOver === "function" && this.props.onRowClick(index);
  }

  handleRowMouseOver = ({index}) => {
    typeof this.props.onRowMouseOver === "function" && this.props.onRowMouseOver(index);
  }

  handleRowMouseOut = ({index}) => {
    typeof this.props.onRowMouseOut === "function" && this.props.onRowMouseOut(index);
  }

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

  rowGetter = ({index}) => {
    const { list } = this.props;
    const id = list[index];
    const instance = id?instanceStore.instances.get(id):{id: null};
    return instance;
  }

  actionsCellRenderer = ({rowData: instance, index}) => {
    const { readOnly } = this.props;
    if (readOnly) {
      return null;
    }
    if (instance.id && instance.fetchError) {
      return (
        <Button bsSize={"xsmall"} bsStyle={"danger"} onClick={this.handleRetry(instance.id)} >
          <FontAwesomeIcon icon="redo-alt"/>
        </Button>
      );
    }
    if (!instance.id || instance.isFetched) {
      return (
        <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleDeleteRow(index)} >
          <FontAwesomeIcon icon="times"/>
        </Button>
      );
    }
    return null;
  }

  labelCellRenderer = ({rowData: instance}) => <LabelCellRenderer instance={instance} />;

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