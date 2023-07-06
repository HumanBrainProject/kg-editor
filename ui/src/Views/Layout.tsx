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

import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import Commit from './Commit';
import Copyright from './Copyright';
import Logo from './Logo';
import Nav from './Nav';
import type { Theme } from '../Themes/Theme';
import type { DefaultTheme} from 'react-jss';

const getBackgroundSize = (theme: Jss.Theme) => {
  const appTheme = theme as Theme;
  if (appTheme.background.size) {
    return appTheme.background.size;
  }
  if (appTheme.background.image) {
    return 'unset';
  }
  return '200%';
};

const useStyles = createUseStyles((theme: Jss.Theme) => {
  const appTheme = theme as Theme;
  return {
    container: {
      height: '100vh',
      display: 'grid',
      overflow: 'hidden',
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto 1fr 20px'
    },
    header: {
      position: 'relative',
      display: 'grid',
      gridTemplateRows: '1fr',
      gridTemplateColumns: 'auto 1fr',
      background: 'var(--bg-color-ui-contrast1)'
    },
    main: {
      position: 'relative',
      overflow: 'hidden',
      background:
        'linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))',
      backgroundSize: getBackgroundSize(theme),
      backgroundImage: appTheme.background.image
        ? `url('${appTheme.background.image}')`
        : 'unset',
      backgroundPosition: appTheme.background.position
        ? appTheme.background.position
        : 'unset',
      backgroundColor: appTheme.backgroundColor
        ? appTheme.backgroundColor
        : 'unset'
    },
    footer: {
      position: 'relative',
      display: 'grid',
      gridTemplateRows: '1fr',
      gridTemplateColumns: '1fr auto',
      background: 'var(--bg-color-ui-contrast1)',
      color: 'var(--ft-color-loud)',
      padding: '0 10px'
    }
  };
});

interface LayoutProps {
  children?: string|JSX.Element|(null|undefined|string|JSX.Element)[];
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme<DefaultTheme>();
  const classes = useStyles({ theme });

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <Logo />
        <Nav />
      </header>
      <main className={classes.main}>{children}</main>
      <footer className={classes.footer}>
        <Copyright />
        <Commit />
      </footer>
    </div>
  );
};

export default Layout;
