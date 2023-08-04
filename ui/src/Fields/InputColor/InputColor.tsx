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
import Color from 'color';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';

import Invalid from '../Invalid';
import Label from '../Label';
import Warning from '../Warning';
import type InputTextStore from '../Stores/InputTextStore';
import type { Field } from '../index';
import type { ChangeEvent} from 'react';

const useStyles = createUseStyles({
  label: {},
  inputColor: {
    display: 'inline-block',
    width: 'revert',
    padding: '0',
    minWidth: '70px',
    paddingRight: '25px'
  },
  blockColor: {
    display: 'inline-block',
    padding: '3px 8px',
    border: '1px solid #ced4da'
  },
  readMode:{
    '& $label:after': {
      content: '\':\\00a0\''
    }
  },
  warning: {
    borderColor: 'var(--ft-color-warn)'
  },
  addColorBtn: {
    fontSize: 'x-small',
    marginLeft: '4px'
  },
  removeColorBtn: {
    display: 'inline-block',
    borderRadius: '50px',
    padding: '2px 5px',
    fontSize: 'xx-small',
    marginTop: '-15px',
    marginLeft: '-23px'
  }
});

interface InputColorProps extends Field {
  fieldStore: InputTextStore;
}

const InputColor = observer(({ fieldStore, className, readMode, showIfNoValue }: InputColorProps) => {

  const classes = useStyles();

  const formGroupRef = useRef<HTMLDivElement>(null);

  const {
    value,
    returnAsNull,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    isRequired,
    isReadOnly
  } = fieldStore;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => fieldStore.setValue(e.target.value);

  const handleAddColor = () => fieldStore.setValue('#000');

  const handleRemoveColor = () => fieldStore.setValue(null);

  if(readMode && !value) {
    if (showIfNoValue) {
      return (
        <Form.Group className={`${classes.readMode} ${className}`}>
          <Label className={classes.label} label={label} />
        </Form.Group>
      );
    }
    return null;
  }

  if(readMode || isReadOnly){

    const color = new Color(value);
    const textColor = color.isLight()?'black':'white';

    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isReadOnly={readMode?false:isReadOnly} />
        <div className={classes.blockColor} style={{backgroundColor: value, color: textColor}} title={value}>{value}</div>
      </Form.Group>
    );
  }

  if (!value) {
    return (
      <Form.Group className={className}>
        <Label className={classes.label} label={label} />
        <Button className={classes.addColorBtn} size="sm" variant="primary" onClick={handleAddColor} title="Set color" >
          <FontAwesomeIcon icon="plus"/>
        </Button>
      </Form.Group>
    );
  }

  const isDisabled = returnAsNull;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;
  return (
    <Form.Group className={className} ref={formGroupRef} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} isReadOnly={isReadOnly} isPublic={isPublic}/>
      <div>
        <Form.Control
          value={value}
          type="color"
          as="input"
          onChange={handleChange}
          disabled={isDisabled}
          className={`${classes.inputColor} ${hasValidationWarnings?classes.warning:''}`}
        />
        <Button className={classes.removeColorBtn} size="sm" variant="secondary" onClick={handleRemoveColor} title="Remove color" >
          <FontAwesomeIcon icon="times"/>
        </Button>
      </div>
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
InputColor.displayName = 'InputColor';

export default InputColor;