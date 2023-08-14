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
import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { createUseStyles } from 'react-jss';
import useStores from '../../Hooks/useStores';
import Filter from '../Filter';
import type { ForwardedRef} from 'react';

const useStyles = createUseStyles({
  dropdownMenu: {
    background: 'var(--bg-color-ui-contrast2)',
    fontSize: '0.9em',
    border: '1px solid var(--border-color-ui-contrast2)'
  },
  list: {
    paddingLeft: '0',
    listStyle: 'none',
    marginBottom: '0',
    height: '500px',
    overflow: 'auto'
  },
  dropdownItem: {
    color: 'var(--ft-color-loud)',
    lineHeight: '1.3rem',
    padding: '4px 8px',
    '&:hover': {
      backgroundColor: 'var(--list-bg-hover)',
      color: 'var(--ft-color-loud)'
    }
  }
});

interface SpaceDropdownMenuComponentProps {
  className: string;
  labeledBy: string;
  wrapperRef: ForwardedRef<HTMLDivElement>;
}

const SpaceDropdownMenuComponent = observer(({className, labeledBy, wrapperRef}: SpaceDropdownMenuComponentProps) => {
  const classes = useStyles();
  const [ filter, setFilter ] = useState('');

  const { userProfileStore } = useStores();

  const handleChange = (value: string) => setFilter(value);

  const spaces = userProfileStore.filterSpaces(filter);

  return (
    <div ref={wrapperRef} className={`${className} ${classes.dropdownMenu}`} aria-labelledby={labeledBy}>
      <Filter value={filter} placeholder="Filter spaces" onChange={handleChange} />
      <ul className={classes.list}>
        {spaces?.map(space =>
          <Dropdown.Item
            key={space.id}
            eventKey={space.id}
            className={classes.dropdownItem}
          >
            {space.name||space.id}
          </Dropdown.Item>
        )}
      </ul>
    </div>
  );
}
);
SpaceDropdownMenuComponent.displayName = 'SpaceDropdownMenuComponent';

interface SpaceDropdownMenuProps {
  className: string;
  'aria-labelledby': string;
}

type WrapperRef = HTMLDivElement;

const SpaceDropdownMenu = React.forwardRef<WrapperRef, SpaceDropdownMenuProps>(
  ({ className, 'aria-labelledby': labeledBy }, ref) => <SpaceDropdownMenuComponent className={className} labeledBy={labeledBy} wrapperRef={ref} />);
SpaceDropdownMenu.displayName = 'SpaceDropdownMenu';

export default SpaceDropdownMenu;