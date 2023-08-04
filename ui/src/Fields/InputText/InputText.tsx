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

import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';

import Alternatives from '../Alternatives';
import Invalid from '../Invalid';
import Label from '../Label';
import Warning from '../Warning';
import type { Alternative } from '../../types';
import type InputTextStore from '../Stores/InputTextStore';
import type { Field } from '../index';
import type { ChangeEvent } from 'react';

const useStyles = createUseStyles({
  alternatives: {
    marginLeft: '3px'
  },
  label: {},
  readMode:{
    '& $label:after': {
      content: '\':\\00a0\''
    }
  },
  warning: {
    borderColor: 'var(--ft-color-warn)'
  }
});

const getStringValue = (value?: any) => !value || typeof value === 'string'? value:JSON.stringify(value);

const getDateValue = (value?: any)  => {
  if (value && typeof value === 'string') {
    const d = new Date(value);
    if (d && d instanceof Date) {
      return d.toLocaleDateString();
    }
    return value;
  }
  return JSON.stringify(value);
};

interface LinesProps {
  lines: string[];
}

const Lines = ({lines}: LinesProps) => (
  <div>
    {lines.map((line, index) => (
      <p key={line+(''+index)}>{line}</p>
    ))}
  </div>
);

interface FieldValueProps {
  field: InputTextStore;
  splitLines: boolean;
}

const FieldValue = ({field, splitLines}: FieldValueProps) => {
  const { value } = field;

  if (splitLines) {
    const lines = typeof value === 'string'?value.split('\n'):[];
    return (
      <Lines lines={lines} />
    );
  }

  const val = (field.inputType === 'date')?getDateValue(value):getStringValue(value);

  return (
    <span>&nbsp;{val}</span>
  );
};

interface AlternativeValueProps {
  alternative: Alternative;
}

const AlternativeValue = observer(({alternative}: AlternativeValueProps) => typeof alternative.value === 'string'?alternative.value:JSON.stringify(alternative.value));
AlternativeValue.displayName = 'AlternativeValue';

const AlternativeDateValue = observer(({alternative}: AlternativeValueProps) => getDateValue(alternative.value));
AlternativeDateValue.displayName = 'AlternativeDateValue';

interface InputTextProps extends Field {
  fieldStore: InputTextStore;
  as: React.ElementType<any>;
}

const InputText = observer(({ fieldStore, className, as, readMode, showIfNoValue }: InputTextProps) => {

  const classes = useStyles();

  const formGroupRef = useRef<HTMLInputElement>(null);

  const {
    value,
    inputType,
    returnAsNull,
    alternatives,
    label,
    labelTooltip,
    labelTooltipIcon,
    isPublic,
    isRequired,
    isReadOnly
  } = fieldStore;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => fieldStore.setValue(e.target.value);

  const handleSelectAlternative = (val: any) => fieldStore.setValue(val);

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode && !value && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isReadOnly={readMode?false:isReadOnly} />
        <FieldValue field={fieldStore} splitLines={as === 'textarea'} />
      </Form.Group>
    );
  }

  const AlternativeValueComponent = inputType === 'date'?AlternativeDateValue:AlternativeValue;

  const isDisabled = returnAsNull;
  const hasValidationWarnings = !isDisabled && fieldStore.hasValidationWarnings;
  const hasWarning = !isDisabled && fieldStore.hasChanged && fieldStore.hasWarning;

  return (
    <Form.Group className={className} ref={formGroupRef} >
      <Label className={classes.label} label={label} labelTooltip={labelTooltip} labelTooltipIcon={labelTooltipIcon} isRequired={isRequired} isPublic={isPublic}/>
      <Alternatives
        className={classes.alternatives}
        list={alternatives}
        onSelect={handleSelectAlternative}
        onRemove={handleRemoveMySuggestion}
        parentContainerRef={formGroupRef}
        ValueRenderer={AlternativeValueComponent}
      />
      {inputType === 'time' ?
        <Form.Control
          value={value}
          type={inputType}
          step={1}
          as={as}
          onChange={handleChange}
          disabled={isDisabled}
          className={hasValidationWarnings?classes.warning:''}
        />:
        <Form.Control
          value={value}
          type={inputType}
          as={as}
          onChange={handleChange}
          disabled={isDisabled}
          className={hasValidationWarnings?classes.warning:''}
        />
      }
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
InputText.displayName = 'InputText';

export default InputText;