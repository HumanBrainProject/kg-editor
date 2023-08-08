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

import {faBan} from '@fortawesome/free-solid-svg-icons/faBan';
import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {observer} from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';

import BGMessage from '../../Components/BGMessage';
import useStores from '../../Hooks/useStores';

import { ViewMode } from '../../types';
import ExternalCreateModal from '../ExternalCreateModal';
import Preview from '../Preview';
import InstanceGraph from './InstanceGraph';
import InstanceManage from './InstanceManage';
import InstanceRaw from './InstanceRaw';
import InstanceRelease from './InstanceRelease';
import InstanceView from './InstanceView';
import SaveBar from './SaveBar';
import Tabs from './Tabs';
import type {Instance as InstanceType} from '../../Stores/Instance';
import type { PreviewInstanceOptions, UUID} from '../../types';

const useStyles = createUseStyles({
  container: {
    display: 'grid',
    height: '100%',
    gridTemplateRows: '100%',
    gridTemplateColumns: '50px 1fr 400px',
    '&.hide-savebar': {
      gridTemplateColumns: '50px 1fr',
      '& $sidebar': {
        display: 'none'
      }
    }
  },
  body: {
    position: 'relative',
    overflow: 'hidden'
  },
  sidebar: {
    position: 'relative',
    background: 'var(--bg-color-ui-contrast2)',
    borderLeft: '1px solid var(--border-color-ui-contrast1)',
    overflow: 'auto',
    color: 'var(--ft-color-loud)'
  },
  previewPanel: {
    position: 'absolute',
    top: 0,
    right: '-600px',
    maxWidth: '45%',
    width: '600px',
    height: '100%',
    color: 'var(--ft-color-loud)',
    background: 'var(--bg-color-ui-contrast2)',
    border: 0,
    borderLeft: '1px solid var(--border-color-ui-contrast1)',
    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
    transition: 'right 0.3s ease-in-out',
    zIndex: 3,
    '&.show': {
      right: 0
    },
    '& h3': {
      margin: '10px 10px 0 10px'
    }
  },
  closePreviewBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '28px',
    height: '30px',
    padding: '5px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  errorMessage: {
    color: 'var(--ft-color-loud)'
  }
});

interface InstanceProps {
  instance: InstanceType;
  mode: ViewMode;
}


const View = observer(({instance, mode}: InstanceProps) => {

  const { typeStore } = useStores();

  const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);

  switch (mode) {
  case ViewMode.CREATE:
    if(instance.permissions?.canCreate && isTypesSupported) {
      return (
        <InstanceView instance={instance} />
      );
    }
    break;
  case ViewMode.EDIT:
    if(instance.permissions?.canWrite && isTypesSupported) {
      return (
        <InstanceView instance={instance} />
      );
    }
    break;
  case ViewMode.VIEW:
    if(instance.permissions?.canRead && isTypesSupported) {
      return (
        <InstanceView instance={instance} />
      );
    }
    break;
  case ViewMode.GRAPH:
    if(instance.permissions?.canRead) {
      return (
        <InstanceGraph instance={instance} />
      );
    }
    break;
  case ViewMode.RELEASE:
    if(instance.permissions?.canRelease && isTypesSupported) {
      return (
        <InstanceRelease instance={instance} />
      );
    }
    break;
  case ViewMode.MANAGE:
    if(instance.permissions?.canRead) {
      return (
        <InstanceManage instance={instance} />
      );
    }
    break;
  case ViewMode.RAW:
    if(instance.permissions?.canRead) {
      return (
        <InstanceRaw instance={instance} />
      );
    }
    break;
  default:
    break;
  }
  return (
    <NoPermissionForView instance={instance} mode={mode} />
  );
});
View.displayName = 'View';

const getActionLabel = (mode: ViewMode) => {
  if (mode === ViewMode.RAW) {
    return 'view';
  }
  if (mode === ViewMode.GRAPH) {
    return 'visualize';
  }
  return mode;
};

interface NoPermissionForViewProps {
  instance: InstanceType;
  mode: ViewMode;
}

const NoPermissionForView = observer(({instance, mode}: NoPermissionForViewProps) => {

  const classes = useStyles();

  return (
    <div className={classes.errorMessage} >
      <BGMessage icon={faBan}>
      You do not have permission to {getActionLabel(mode)} the instance &quot;<i>{instance.id}&quot;</i>.<br /><br />
        {instance.permissions?.canRead?
          <Link className="btn btn-primary" to={`/instances/${instance.id}`}>Go to view</Link>:
          <Link className="btn btn-primary" to={'/browse'}>Go to browse</Link>}
      </BGMessage>
    </div>
  );
});


const Instance = observer(({ instance, mode }: InstanceProps) =>  {

  const classes = useStyles();

  const { instanceStore } = useStores();

  const handleHidePreview = () => instanceStore.togglePreviewInstance();

  const previewInstance = instanceStore.previewInstance;

  const previewOptions = (previewInstance?.options) ?? {
    showEmptyFields: false,
    showAction: false,
    showType: false,
    showStatus: false
  } as PreviewInstanceOptions;

  return (
    <>
      <div className={`${classes.container} ${!instanceStore.hasUnsavedChanges && mode !== 'edit'? 'hide-savebar':''}`}>
        <Tabs mode={mode} instance={instance} />
        <div className={classes.body}>
          <View instance={instance} mode={mode} />
        </div>
        <div className={classes.sidebar}>
          <SaveBar/>
        </div>
      </div>
      <div className={`${classes.previewPanel} ${previewInstance?'show':''}`}>
        {previewInstance && (
          <>
            <h3>Preview</h3>
            <Preview instanceId={previewInstance.id as UUID}
              instanceName={previewInstance.name}
              showEmptyFields={previewOptions.showEmptyFields}
              showAction={previewOptions.showAction}
              showTypes={previewOptions.showType}
              showStatus={previewOptions.showStatus} />
            <div className={classes.closePreviewBtn} title="close preview" onClick={handleHidePreview}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </>
        )}
      </div>
      <ExternalCreateModal />
    </>
  );
});
Instance.displayName = 'Instance';

export default Instance;