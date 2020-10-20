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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { createUseStyles } from "react-jss";
import { debounce } from "lodash";
import { Column, Table as TableComponent } from "react-virtualized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Button} from "react-bootstrap";

import instancesStore from "../../Stores/InstancesStore";

const useStyles = createUseStyles({
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
});

const LabelCellRenderer = observer(({ instanceId }) => {

  useEffect(() => instancesStore.createInstanceOrGet(instanceId).fetchLabel(), [instanceId]);

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
});

const ActionsCellRenderer = observer(({ index, instanceId, readOnly, onRetry, onDeleteRow }) => {

  if (readOnly) {
    return null;
  }

  const handleRetry = e => {
    e.stopPropagation();
    onRetry(instanceId);
  };

  const handleDelete = e => {
    e.stopPropagation();
    onDeleteRow(index);
  };

  const instance = instanceId && instancesStore.instances.get(instanceId);

  if (instance && instance.fetchError) {
    return (
      <Button bsSize={"xsmall"} bsStyle={"danger"} onClick={handleRetry} >
        <FontAwesomeIcon icon="redo-alt"/>
      </Button>
    );
  }

  if (!instance || instance.isFetched || instance.isLabelFetched) {
    return (
      <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={handleDelete} >
        <FontAwesomeIcon icon="times"/>
      </Button>
    );
  }
  return null;
});

const Table = observer(({ list, fieldStore, readOnly, enablePointerEvents, onRowDelete, onRowClick, onRowMouseOver, onRowMouseOut}) => {

  const classes = useStyles();
  const scrollToIndex = -1;

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  const handleDeleteRow = index => onRowDelete(index);

  const handleRetry = id => fieldStore.fetchInstance(id);

  const handleRowClick = ({index}) => onRowMouseOver && onRowClick(index);

  const handleRowMouseOver = ({index}) => onRowMouseOver && onRowMouseOver(index);

  const handleRowMouseOut = ({index}) => onRowMouseOut && onRowMouseOut(index);

  const updateContainerWidth = debounce(() => {
    if(this.wrapperRef){
      setContainerWidth(this.wrapperRef.offsetWidth);
    }
  }, 250);

  const rowClassName = ({index}) => {
    if (index < 0) {
      return classes.headerRow;
    } else {
      return `${index % 2 === 0 ? classes.evenRow : classes.oddRow} ${enablePointerEvents?classes.activeRow:""}`;
    }
  };

  const rowGetter = ({index}) => list[index];

  const actionsCellRenderer = ({rowData: instanceId, rowIndex}) => (
    <ActionsCellRenderer
      instanceId={instanceId}
      index={rowIndex}
      readOnly={readOnly}
      onRetry={handleRetry}
      onDeleteRow={handleDeleteRow}
    />
  );

  const labelCellRenderer = ({rowData: instanceId}) => <LabelCellRenderer instanceId={instanceId} />;

  return (
    <div className={classes.container} ref={ref=>this.wrapperRef = ref}>
      <TableComponent
        width={containerWidth}
        height={300}
        headerHeight={20}
        rowHeight={30}
        rowClassName={rowClassName}
        rowCount={list.length}
        rowGetter={rowGetter}
        onRowClick={enablePointerEvents?handleRowClick:null}
        onRowMouseOver={enablePointerEvents?handleRowMouseOver:null}
        onRowMouseOut={enablePointerEvents?handleRowMouseOut:null}
        scrollToIndex={scrollToIndex-1}
      >
        <Column
          label="Name"
          dataKey="name"
          flexGrow={1}
          flexShrink={0}
          width={20}
          cellRenderer={labelCellRenderer}
        />
        <Column
          label={""}
          dataKey="Actions"
          flexGrow={0}
          flexShrink={1}
          width={20}
          cellRenderer={actionsCellRenderer}
        />
      </TableComponent>
    </div>
  );
});

export default Table;