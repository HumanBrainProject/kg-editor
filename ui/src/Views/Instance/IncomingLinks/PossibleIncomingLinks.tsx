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
import React from 'react';
import { createUseStyles } from 'react-jss';
import Label from '../../../Fields/Label';
import PossibleIncomingLink from './PossibleIncomingLink';
import type { SimpleType, SourceType } from '../../../types';

const useStyles = createUseStyles({
  container: {
    '& > ul': {
      listStyle: 'none',
      paddingLeft: '20px',
      '& > li': {
        display: 'inline',
        '& + li:before': {
          content: '\' \''
        }
      }
    }
  }
});

interface PossibleIncomingLinksProps {
  links: SourceType[];
  type: SimpleType;
}

const PossibleIncomingLinks = observer(({ links, type }: PossibleIncomingLinksProps) => {

  const classes = useStyles();

  if(!links || !links.length) {
    return null;
  }

  return(
    <div className={classes.container}>
      <Label label={`${type} can be linked from`}/>
      <ul>
        {links.map((l, index) => (
          <li key={index}>
            <PossibleIncomingLink type={l.type} spaces={l.spaces} />
          </li>
        ))}
      </ul>
    </div>
  );
});
PossibleIncomingLinks.displayName = 'PossibleIncomingLinks';

export default PossibleIncomingLinks;