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

import {faCogs} from '@fortawesome/free-solid-svg-icons/faCogs';
import {faGlobe} from '@fortawesome/free-solid-svg-icons/faGlobe';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faLongArrowAltLeft} from '@fortawesome/free-solid-svg-icons/faLongArrowAltLeft';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { createUseStyles } from 'react-jss';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

const useStyles = createUseStyles({
  label: {
    fontWeight: 'bold',
    marginBottom: '5px'
  }
});

interface LabelTooltipProps {
  tooltip: string;
  icon?: IconProp;
}

const LabelTooltip = ({tooltip, icon}:LabelTooltipProps) => (
  <>
  &nbsp;
    <OverlayTrigger placement="top" overlay={<Tooltip id={uniqueId('label-tooltip')}>{tooltip}</Tooltip>}>
      <span><FontAwesomeIcon icon={icon??faInfoCircle}/></span>
    </OverlayTrigger>
  </>
);

interface LabelProps {
  className?: string;
  label?: string;
  labelTooltip?: string;
  labelTooltipIcon?: IconProp;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isPublic?: boolean;
  isInferred?: boolean;
}

const Label = ({ className, label, labelTooltip, labelTooltipIcon, isReadOnly, isRequired, isPublic, isInferred }: LabelProps) => {
  const classes = useStyles();
  return (
    <Form.Label className={`${classes.label} ${className??''}`}>
      {label}{isRequired && ' *'}
      {isReadOnly && <LabelTooltip tooltip="This value is populated automatically by the automation system" icon={faCogs} />}
      {isPublic && <LabelTooltip tooltip="This field will be publicly accessible for every user. (Even for users without read access)" icon={faGlobe} />}
      {labelTooltip && <LabelTooltip tooltip={labelTooltip} icon={labelTooltipIcon} />}
      {isInferred && <LabelTooltip tooltip="This value is currently inferred" icon={faLongArrowAltLeft} />}
    </Form.Label>
  );
};

export default Label;