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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { createUseStyles } from 'react-jss';

import BGMessage from '../../Components/BGMessage';
import Spinner from '../../Components/Spinner';
import CompareValue from './CompareValue';
import type Instance from '../../Stores/Instance';
import type InstanceStore from '../../Stores/InstanceStore';

const useStyles = createUseStyles({
  container: {
    padding: '12px 15px',
    '& button + button': {
      marginLeft: '20px'
    }
  }
});

const separator = '; ';

const getLabel = (instanceStore: InstanceStore, field, value) => {
  const id = value[field.mappingValue];
  if (!id) {
    return 'Unknown instance';
  }

  const instance = instanceStore.instances.get(id);

  if (instance && (instance.isFetched || instance.isLabelFetched)) {
    return instance.name;
  }
  return id;
};

const getNestedFieldValue = (instanceStore: InstanceStore, fields, level: number) => {
  const tabs = Array.from({ length: level }, () => '\t').join('');
  let result = `${tabs}[`;
  fields.forEach(row => {
    result += `\n\t${tabs}{`;
    Object.values(row).forEach(store => result += `\n\t\t${tabs}${store.label}:${getFieldValue(instanceStore, store, level + 1)}`);
    result += `\n\t${tabs}}\n`;
  });
  result += ']';
  return result;
};

const getFieldValue = (instanceStore: InstanceStore, field, level: number) => {
  if (field.widget === 'Nested') {
    return getNestedFieldValue(instanceStore, field.nestedFieldsStores, level);
  }
  const value = field.returnValue;
  if (value === 'https://core.kg.ebrains.eu/vocab/resetValue') {
    return '';
  }
  if (field.isLink) {
    if (!value) {
      return 'null';
    }
    const vals = Array.isArray(value)?value:[value];
    if (vals.length) {
      return vals.map(val => getLabel(instanceStore, field, val)).join(separator);
    }
    return '';
  }
  if (!value) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.join(separator);
  }
  if (typeof value === 'object') {
    return 'Unknown value';
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value.toString();
  }
  return value;
};

const getValue = (instanceStore: InstanceStore, instance:Instance, name: string) => {
  if (!instance) {
    return '';
  }
  const field = instance.fields[name];
  return getFieldValue(instanceStore, field, 0);
};

const getStatus = (store: InstanceStore, ids: string[]) => ids.reduce((acc, id) => {
  const instance = store.instances.get(id);
  acc.isFetched = acc.isFetched && instance && (instance.isFetched || instance.isLabelFetched || instance.isNotFound || instance.isLabelNotFound);
  acc.isFetching = acc.isFetching || (instance && (instance.isFetching || instance.isLabelFetching));
  acc.hasFetchError = acc.hasFetchError || (instance && instance.fetchLabelError && !instance.isLabelNotFound);
  return acc;
}, {
  isFetched: true,
  isFetching: false,
  hasFetchError: false
});

interface CompareFieldsChangesProps {
  instanceId: string;
  leftInstance: Instance;
  rightInstance: Instance;
  leftInstanceStore: InstanceStore;
  rightInstanceStore: InstanceStore;
  leftChildrenIds: string[];
  rightChildrenIds: string[];
  onClose: () => void;
}

const CompareFieldsChanges = observer(({ instanceId, leftInstance, rightInstance, leftInstanceStore, rightInstanceStore, leftChildrenIds, rightChildrenIds, onClose }: CompareFieldsChangesProps) => {

  const classes = useStyles();

  useEffect(() => {
    fetchInstances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftChildrenIds, rightChildrenIds]);

  const fetchInstances = (forceFetch=false) => {
    leftChildrenIds.forEach(id => leftInstanceStore.createInstanceOrGet(id)?.fetchLabel(forceFetch));
    rightChildrenIds.forEach(id => rightInstanceStore.createInstanceOrGet(id)?.fetchLabel(forceFetch));
  };

  const handleRetryFetchInstances = () => fetchInstances(true);

  const leftStatus = getStatus(leftInstanceStore, leftChildrenIds);
  const rightStatus = getStatus(rightInstanceStore, rightChildrenIds);

  if (leftStatus.isFetching || rightStatus.isFetching) {
    return (
      <div className={classes.container}>
        <Spinner text={`Retrieving children of instance ${instanceId}...`} />
      </div>
    );
  }

  if (leftStatus.hasFetchError || rightStatus.hasFetchError) {
    return (
      <div className={classes.container}>
        <BGMessage icon={'ban'}>
            There was a network problem retrieving the links of instance &quot;<i>{instanceId}</i>&quot;.<br/>
            If the problem persists, please contact the support.<br/><br/>
          <div>
            <Button onClick={onClose}><FontAwesomeIcon icon={'times'}/>&nbsp;&nbsp; Cancel</Button>
            <Button variant={'primary'} onClick={handleRetryFetchInstances}><FontAwesomeIcon icon={'redo-alt'}/>&nbsp;&nbsp; Retry</Button>
          </div>
        </BGMessage>
      </div>
    );
  }

  if (leftStatus.isFetched && rightStatus.isFetched) {
    const fields = rightInstance.sortedFieldNames.map(name => (
      {
        name: name,
        label: rightInstance.fields[name].label,
        leftValue: getValue(leftInstanceStore, leftInstance, name),
        rightValue: getValue(rightInstanceStore, rightInstance, name)
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
CompareFieldsChanges.displayName = 'CompareFieldsChanges';

export default CompareFieldsChanges;