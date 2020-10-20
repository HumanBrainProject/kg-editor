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

import React, { useEffect } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import CompareValue from "./CompareValue";

const useStyles = createUseStyles({
  container: {
    padding: "12px 15px",
    "& button + button": {
      marginLeft: "20px"
    }
  }
});

const separator = "; ";

const getLabel = (instancesStore, field, value) => {
  const id = value[field.mappingValue];
  if (!id) {
    return "Unkown instance";
  }

  const instance = instancesStore.instances.get(id);

  if (instance && (instance.isFetched || instance.isLabelFetched)) {
    return instance.name;
  }
  return id;
};

const getValue = (instancesStore, instance, name) => {
  if (!instance) {
    return "";
  }
  const field = instance.fields[name];
  const value = field.returnValue;
  if (!value) {
    return "";
  }
  if (!field.isLink) {
    if (Array.isArray(value)) {
      return value.join(separator);
    }
    if (typeof value === "object") {
      return "Unknown value";
    }
    if (typeof value === "boolean") {
      return value.toString();
    }
    return value;
  }
  const vals = Array.isArray(value)?value:[value];
  if (vals.length) {
    return vals.map(val => getLabel(instancesStore, field, val)).join(separator);
  }
  return "";
};

const getStatus = (store, ids) => ids.reduce((acc, id) => {
  const instance = store.instances.get(id);
  acc.isFetched = acc.isFetched && instance && (instance.isFetched || instance.isLabelFetched);
  acc.isFetching = acc.isFetching || (instance && (instance.isFetching || instance.isLabelFetching));
  acc.hasFetchError = acc.hasFetchError || (instance && instance.fetchLabelError);
  return acc;
}, {
  isFetched: true,
  isFetching: false,
  hasFetchError: false
});

const CompareFieldsChanges = observer(({ instanceId, leftInstance, rightInstance, leftInstanceStore, rightInstanceStore, leftChildrenIds, rightChildrenIds, onClose }) => {

  const classes = useStyles();

  useEffect(() => fetchInstances(), [leftChildrenIds, rightChildrenIds]);

  const fetchInstances = (forceFetch=false) => {
    leftChildrenIds.forEach(id => leftInstanceStore.createInstanceOrGet(id).fetchLabel(forceFetch));
    rightChildrenIds.forEach(id => rightInstanceStore.createInstanceOrGet(id).fetchLabel(forceFetch));
  };

  const handleRetryFetchInstances = () => fetchInstances(true);

  const leftStatus = getStatus(leftInstanceStore, leftChildrenIds);
  const rightStatus = getStatus(rightInstanceStore, rightChildrenIds);

  if (leftStatus.isFetching || rightStatus.isFetching) {
    return (
      <div className={classes.container}>
        <FetchingLoader>Fetching instance &quot;<i>{instanceId}</i>&quot; data...</FetchingLoader>
      </div>
    );
  }

  if (leftStatus.hasFetchError || rightStatus.hasFetchError) {
    return (
      <div className={classes.container}>
        <BGMessage icon={"ban"}>
            There was a network problem fetching the links of instance &quot;<i>{instanceId}</i>&quot;.<br/>
            If the problem persists, please contact the support.<br/><br/>
          <div>
            <Button onClick={onClose}><FontAwesomeIcon icon={"times"}/>&nbsp;&nbsp; Cancel</Button>
            <Button bsStyle={"primary"} onClick={handleRetryFetchInstances}><FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry</Button>
          </div>
        </BGMessage>
      </div>
    );
  }

  if (leftStatus.isFetched && rightStatus.isFetched) {
    const fields = [...rightInstance.promotedFields, ...rightInstance.nonPromotedFields].map(name => (
      {
        name: name,
        label: rightInstance.fields[name].label,
        leftValue: getValue(leftInstanceStore, leftInstance, name),
        rightValue: getValue(rightInstanceStore, rightInstance, name),
      })
    );

    return (
      <div className={classes.container}>
        {fields.map(({name, label, leftValue, rightValue}) => (
          <CompareValue key={name} label={label} leftValue={leftValue} rightValue={rightValue} separator={separator} />
        ))}
      </div>
    );
  }
  return null;
});

export default CompareFieldsChanges;