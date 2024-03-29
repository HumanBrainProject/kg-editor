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
import { useNavigate } from 'react-router-dom';

import useStores from '../Hooks/useStores';

const useStyles = createUseStyles({
  container: {
    padding: '10px',
    cursor: 'pointer',
    '& span': {
      color: 'var(--ft-color-loud)',
      display: 'inline-block',
      paddingLeft: '10px',
      fontSize: '0.9em',
      borderLeft: '1px solid var(--border-color-ui-contrast5)',
      marginLeft: '10px'
    },
    '&:hover span': {
      color: 'var(--ft-color-louder)'
    }
  }
});

const Logo = observer(() => {
  const classes = useStyles();

  const { appStore } = useStores();
  const navigate = useNavigate();

  const handleGoToHome = () => navigate('/');

  const logo = appStore.currentTheme.name === 'default'?`${window.rootPath}/assets/ebrains.svg`:`${window.rootPath}/assets/ebrains_dark.svg`;

  return (
    <div className={`${classes.container} layout-logo`} onClick={handleGoToHome}>
      <img src={logo} alt="" height="30" />
      <span>Knowledge Graph Editor</span>
    </div>
  );
});
Logo.displayName = 'Logo';

export default Logo;

