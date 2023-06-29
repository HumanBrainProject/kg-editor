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

import React, { useEffect, useState, useRef, MouseEvent } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import debounce from "lodash/debounce";
import { Column, Table as TableComponent } from "react-virtualized";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import useStores from "../../Hooks/useStores";
import LinksStore from "../Stores/LinksStore";

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
      backgroundColor: "var(--link-bg-color-hover)"
    }
  },
  actionBtn: {
    padding: "1px 6px 1px 6px"
  },
  circular: {
    color: "var(--bs-danger)",
    "&:hover": {
      color: "var(--bs-danger)"
    }
  }
});

interface LabelCellRendererProps {
  instanceId: string;
  mainInstanceId: string; 
  className: string;
}

const LabelCellRenderer = observer(({ instanceId, mainInstanceId, className }: LabelCellRendererProps) => {

  const { instanceStore } = useStores();

  useEffect(() => {
    instanceStore.createInstanceOrGet(instanceId)?.fetchLabel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const instance = instanceId && instanceStore.instances.get(instanceId);

  if (!instance) {
    return "Unknown instance";
  }

  if (instance.fetchError || instance.fetchLabelError) {
    return (
      <span style={{color: "var(--ft-color-error)"}}>
        <FontAwesomeIcon icon="exclamation-triangle"/>
        &nbsp; {instance.fetchError || instance.fetchLabelError}
      </span>
    );
  }

  if (instance.isFetched || instance.isLabelFetched) {
    const isCircular = mainInstanceId === instanceId;
    return <span className={`${isCircular?className:""}`} title="This link points to itself!">{instance.name}</span>;
  }

  if (instance.isFetching || instance.isLabelFetching) {
    return (
      <span>
        <FontAwesomeIcon icon="circle-notch" spin/>
          &nbsp; retrieving {instance.id}...
      </span>
    );
  }

  return instanceId;
});
LabelCellRenderer.displayName = "LabelCellRenderer";

interface ActionsCellRendererProps {
  index: number;
  instanceId: string;
  readOnly: boolean;
  onRetry: (id: string) => void;
  onDeleteRow: (index: number) => void;
}

const ActionsCellRenderer = observer(({ index, instanceId, readOnly, onRetry, onDeleteRow }: ActionsCellRendererProps) => {

  const classes = useStyles();

  if (readOnly) {
    return null;
  }

  const handleRetry = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRetry(instanceId);
  };

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDeleteRow(index);
  };

  const { instanceStore } = useStores();

  const instance = instanceId && instanceStore.instances.get(instanceId);

  if (instance && instance.fetchError) {
    return (
      <Button className={classes.actionBtn} size="sm" variant={"danger"} onClick={handleRetry} >
        <FontAwesomeIcon icon="redo-alt"/>
      </Button>
    );
  }

  if (!instance || instance.isFetched || instance.isLabelFetched) {
    return (
      <Button className={classes.actionBtn} size="sm" variant={"primary"} onClick={handleDelete} >
        <FontAwesomeIcon icon="times"/>
      </Button>
    );
  }
  return null;
});
ActionsCellRenderer.displayName = "ActionsCellRenderer";

interface TableProps {
  mainInstanceId: string;
  list: any;
  fieldStore: LinksStore;
  readOnly: boolean;
  enablePointerEvents: boolean;
  onRowDelete: (index: number) => void;
  onRowClick: (index: number) => void;
  onRowMouseOver: (index: number) => void;
  onRowMouseOut: (index: number) => void;
}

const Table = ({ mainInstanceId, list, fieldStore, readOnly, enablePointerEvents, onRowDelete, onRowClick, onRowMouseOver, onRowMouseOut }: TableProps) => {

  const classes = useStyles();
  const scrollToIndex = -1;

  const [containerWidth, setContainerWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteRow = (index: number) => onRowDelete(index);

  const handleRetry = (id: string) => fieldStore.fetchInstance(id); //TODO: fix this. THis is not correct! 

  const handleRowClick = ({index}: {index:number}) => onRowClick && onRowClick(index);

  const handleRowMouseOver = ({index}: {index:number}) => onRowMouseOver && onRowMouseOver(index);

  const handleRowMouseOut = ({index}: {index:number}) => onRowMouseOut && onRowMouseOut(index);

  const updateContainerWidth = debounce(() => {
    if(wrapperRef.current){
      setContainerWidth(wrapperRef.current.offsetWidth);
    }
  }, 250);

  const rowClassName = ({index}: {index:number}) => {
    if (index < 0) {
      return classes.headerRow;
    } else {
      const isCircular = list[index] === mainInstanceId;
      return `${index % 2 === 0 ? classes.evenRow : classes.oddRow} ${(enablePointerEvents && !isCircular)?classes.activeRow:""}`;
    }
  };

  const rowGetter = ({index}: {index:number}) => list[index];

  const actionsCellRenderer = ({rowData: instanceId, rowIndex}: {rowData:string, rowIndex:number}) => (
    <ActionsCellRenderer
      instanceId={instanceId}
      index={rowIndex}
      readOnly={readOnly}
      onRetry={handleRetry}
      onDeleteRow={handleDeleteRow}
    />
  );

  const labelCellRenderer = ({rowData: instanceId}:{rowData: string}) => <LabelCellRenderer instanceId={instanceId} mainInstanceId={mainInstanceId} className={classes.circular}/>;

  return (
    <div className={classes.container} ref={wrapperRef}>
      <TableComponent
        width={containerWidth}
        height={300}
        headerHeight={20}
        rowHeight={30}
        rowClassName={rowClassName}
        rowCount={list.length}
        rowGetter={rowGetter}
        onRowClick={enablePointerEvents?handleRowClick:undefined}
        onRowMouseOver={enablePointerEvents?handleRowMouseOver:undefined}
        onRowMouseOut={enablePointerEvents?handleRowMouseOut:undefined}
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
        {enablePointerEvents &&
        <Column
          label={""}
          dataKey="Actions"
          width={25}
          style={{marginRight:"6px"}}
          cellRenderer={actionsCellRenderer}
        />
        }
      </TableComponent>
    </div>
  );
};

export default Table;