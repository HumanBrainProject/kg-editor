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
import React, {useEffect} from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { createUseStyles } from 'react-jss';

import useStores from '../Hooks/useStores';
import Matomo from '../Services/Matomo';

import InstancesHistory from './Home/InstancesHistory';
import KeyboardShortcuts from './Home/KeyboardShortcuts';
import ThemeSwitcher from './Home/ThemeSwitcher';
import TipsOfTheDay from './Home/TipsOfTheDay';

const rootPath = window.rootPath || '';

const DisplayName = observer(() => {

  const { userProfileStore } = useStores();

  if (userProfileStore.isAuthorized && userProfileStore.user && userProfileStore.user.givenName) {
    return userProfileStore.user.givenName;
  }

  if (userProfileStore.user?.name) {
    const firstNameReg = /^([^ ]+) .*$/;
    if (userProfileStore.user.name && firstNameReg.test(userProfileStore.user.name)) {
      const match = userProfileStore.user.name.match(firstNameReg);
      if(match) {
        return match[1];
      }
    }
    return userProfileStore.user.name;
  }

  if (userProfileStore.user?.username) {
    return userProfileStore.user.username;
  }

  return '';
});
DisplayName.displayName = 'DisplayName';

const useStyles = createUseStyles({
  container: {
    width: '100%',
    height: '100%',
    color: 'var(--ft-color-normal)'
  },
  panel: {
    display: 'grid',
    width: '100%',
    padding: '15px',
    gridGap: '10px',
    gridTemplateColumns: 'calc(80% - 10px) 20%',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: `"welcome nav"
                        "main features"`
  },
  welcome: {
    gridArea: 'welcome',
    position: 'relative',
    height: '125px',
    '@media screen and (min-height:1200px)': {
      height: '220px'
    },
    '& h1': {
      position: 'absolute',
      bottom: '10px',
      margin: '0',
      fontSize: '4.5em'
    }
  },
  nav: {
    gridArea: 'nav'
  },
  main: {
    gridArea: 'main',
    position: 'relative',
    '& > * + *': {
      marginTop: '10px'
    },
    '& .widget-list': {
      '& > * + *': {
        margin: '10px 0 0 0'
      },
      '@media screen and (min-width:1600px)': {
        display: 'flex',
        '& > * + *': {
          margin: '0 0 0 10px'
        }
      }
    }
  },
  features: {
    gridArea: 'features',
    position: 'relative',
    marginTop: '64px',
    '& .widget-list': {
      '& > * + *': {
        margin: '10px 0 0 0'
      }
    }
  },
  cat:{
    display: 'none',
    '@media screen and (min-width:1200px)': {
      display: 'block',
      position: 'absolute',
      bottom: '-145px',
      left: '-480px',
      transform: 'scale(0.3)',
      animation: 'walk 180s linear infinite',
      zIndex: 10000
    }
  },
  '@keyframes walk': {
    '0%':{
      top: '-100px',
      left: '-480px',
      transform: 'scale(0.3)'
    },
    '5%':{
      top: '-100px',
      left: '-480px',
      transform: 'scale(0.3)'
    },
    '45%':{
      top: '-100px',
      left: 'calc(100% + 480px)',
      transform: 'scale(0.3)'
    },
    '50%':{
      top: '-100px',
      left: 'calc(100% + 480px)',
      transform: 'scale(0.3)'
    },
    '51%':{
      top: 'unset',
      left: 'calc(100% + 480px)',
      transform: 'scale(0.3) rotateY(180deg)'
    },
    '55%':{
      top: 'unset',
      left: 'calc(100% + 480px)',
      transform: 'scale(0.3) rotateY(180deg)'
    },
    '95%':{
      top: 'unset',
      left: '-480px',
      transform: 'scale(0.3) rotateY(180deg)'
    },
    '100%':{
      top: 'unset',
      left: '-480px',
      transform: 'scale(0.3) rotateY(180deg)'
    }
  },
  spacesSelection: {
    fontSize: '1.5em',
    padding: '0 0 30px 0',
    '& h1': {
      padding: '0 30px 20px 30px'
    },
    '& p': {
      padding: '0 30px',
      fontWeight: '300'
    }
  },
  spaces: {
    display: 'grid',
    padding: '0 30px',
    gridGap: '15px',
    gridTemplateColumns: 'repeat(1fr)',
    '@media screen and (min-width:768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    '@media screen and (min-width:1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    }
  },
  space: {
    position: 'relative',
    padding: '20px',
    fontWeight: '300',
    textAlign: 'center',
    border: '1px solid var(--border-color-ui-contrast2)',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '1.2em',
    wordBreak: 'break-word',
    '@media screen and (min-width:768px)': {
      whiteSpace: 'nowrap'
    },
    '&:hover': {
      background: '#f3f3f3'
    }
  },
  spaceSelectionModal: {
    overflow: 'hidden',
    width: '90%',
    margin: 'auto',
    '@media screen and (min-width:1024px)': {
      width: '900px'
    },
    '&.modal-dialog': {
      marginTop: '25vh',
      '& .modal-body': {
        padding: '0',
        maxHeight: 'calc(100vh - 30vh -80px)',
        overflowY: 'hidden'
      }
    }
  },
  noSpacesModal: {
    '&.modal-dialog': {
      marginTop: '40vh',
      '& .modal-body': {
        padding: '0 30px 15px 30px',
        fontSize: '1.6rem',
        '@media screen and (min-width:768px)': {
          whiteSpace: 'nowrap'
        }
      }
    }
  }
});

const Home = () => {
  const classes = useStyles();

  useEffect(() => {
    Matomo.trackCustomUrl(window.location.href);
    Matomo.trackPageView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        <div className={classes.panel}>
          <div className={classes.welcome}>
            <h1>Welcome <span><DisplayName /></span></h1>
          </div>
          <div className={classes.nav}>
            <ThemeSwitcher/>
          </div>
          <div className={classes.main}>
            <InstancesHistory />
          </div>
          <div className={classes.features}>
            <div className="widget-list">
              <KeyboardShortcuts />
            </div>
          </div>
        </div>
        <TipsOfTheDay />
      </Scrollbars>
      <img className={classes.cat} src={`${window.location.protocol}//${window.location.host}${rootPath}/assets/cat.gif`} alt="cat" />
    </div>
  );
};

export default Home;