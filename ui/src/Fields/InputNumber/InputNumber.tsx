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
import type InputNumberStore from '../Stores/InputNumberStore';
import type { ChangeEvent} from 'react';

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

interface AlternativeValueProps {
  alternative: Alternative;
}

const AlternativeValue = observer(({alternative}: AlternativeValueProps) => JSON.stringify(alternative.value));
AlternativeValue.displayName = 'AlternativeValue';

interface InputNumberProps {
  fieldStore: InputNumberStore;
  className: string;
  readMode: boolean;
  showIfNoValue: boolean;
}

const InputNumber = observer(({ fieldStore, className, readMode, showIfNoValue }: InputNumberProps) => {

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

  const handleSelectAlternative = (val: any) => fieldStore.setValue(val); //TODO: check if this is correct and if it can be typed

  const handleRemoveMySuggestion = () => fieldStore.setValue(null);

  if(readMode && !value && !showIfNoValue) {
    return null;
  }

  if(readMode || isReadOnly){

    const val = !value || typeof value === 'string'? value:String(value);
    return (
      <Form.Group className={`${classes.readMode} ${className}`}>
        <Label className={classes.label} label={label} isReadOnly={readMode?false:isReadOnly} />
        <span>&nbsp;{val}</span>
      </Form.Group>
    );
  }

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
        ValueRenderer={AlternativeValue}
      />
      <Form.Control
        value={value ? value: undefined}
        type={inputType}
        onChange={handleChange}
        disabled={isDisabled}
        className={hasValidationWarnings?classes.warning:''}
      />
      <Invalid show={hasValidationWarnings} messages={fieldStore.validationWarnings} />
      <Warning show={hasWarning} message={fieldStore.warning} />
    </Form.Group>
  );
});
InputNumber.displayName = 'InputNumber';

export default InputNumber;