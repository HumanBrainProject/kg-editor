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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';

import Field from '../../../Fields/Field';
import Label from '../../../Fields/Label';
import { ViewContext, PaneContext } from '../../../Stores/ViewStore';
import { ViewMode } from '../../../types';
import IncomingLinks from '../IncomingLinks/IncomingLinks';
import PossibleIncomingLinks from '../IncomingLinks/PossibleIncomingLinks';
import type Instance from '../../../Stores/Instance';

const useStyles = createUseStyles({
  container: {
    margin: '0',
    padding: '0',
    border: '0',
    borderRadius: '0',
    boxShadow: 'none',
    backgroundColor: 'transparent'
  },
  field: {
    marginBottom: '10px',
    wordBreak: 'break-word'
  },
  label: {
    '&:after': {
      content: '\':\\00a0\''
    }
  },
  errorMessage: {
    marginBottom: '15px',
    fontWeight:'300',
    fontSize:'1em',
    color: 'var(--ft-color-error)',
    '& path':{
      fill:'var(--ft-color-error)',
      stroke:'rgba(200,200,200,.1)',
      strokeWidth:'3px'
    }
  }
});

interface NoPermissionForViewProps {
  instance: Instance;
  mode: string;
}

const NoPermissionForView = observer(({ instance, mode }: NoPermissionForViewProps) => {

  const classes = useStyles();

  return (
    <>
      <Label className={classes.label} label="Name" />{instance.name}
      <div className={classes.errorMessage}>
        <FontAwesomeIcon icon={faBan} /> You do not have permission to {mode} the instance.
      </div>
    </>
  );
});
NoPermissionForView.displayName = 'NoPermissionForView';

interface BodyPanelProps {
  className: string;
  instance: Instance;
  readMode: boolean;
}

const BodyPanel = observer(({ className, instance, readMode}: BodyPanelProps) => {

  const classes = useStyles();

  const view = React.useContext(ViewContext);
  const pane = React.useContext(PaneContext);

  if (readMode) {
    if(!instance.permissions?.canRead) {
      return (
        <Form className={`${classes.container} ${className}`} >
          <NoPermissionForView instance={instance} mode={ViewMode.VIEW} />
        </Form>
      );
    }
  } else { // edit
    if(!instance.permissions?.canWrite) {
      return (
        <Form className={`${classes.container} ${className}`} >
          <NoPermissionForView instance={instance} mode={ViewMode.EDIT} />
        </Form>
      );
    }
  }

  return (
    <Form className={`${classes.container} ${className}`} >
      {instance.sortedFieldNames.map(name => {
        const fieldStore = instance.fields[name];
        return (
          <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} view={view} pane={pane} readMode={readMode} enablePointerEvents={true} showIfNoValue={false} />
        );
      })}
      <IncomingLinks links={instance.incomingLinks} readMode={false} />
      {!readMode && <PossibleIncomingLinks links={instance.possibleIncomingLinks} type={instance.primaryType.label} />}
    </Form>
  );
});
BodyPanel.displayName = 'BodyPanel';

export default BodyPanel;