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
import { createUseStyles } from 'react-jss';
import { useNavigate, useSearchParams } from 'react-router-dom';

import useStores from '../Hooks/useStores';
import Matomo from '../Services/Matomo';
import Instances from './Browse/Instances';
import Types from './Browse/Types';

const useStyles = createUseStyles({
  container: {
    display:'grid',
    gridTemplateColumns:'318px 1fr',
    gridTemplateRows:'1fr',
    overflow:'hidden',
    height:'100%'
  }
});

const Browse = observer(() => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const space = searchParams.get('space');
  const type = searchParams.get('type');

  const { browseStore, typeStore } = useStores();

  useEffect(() => {
    Matomo.trackCustomUrl(window.location.href);
    Matomo.trackPageView();

    const typeToSelect = type && typeStore.typesMap.get(type);
    if (typeToSelect && typeToSelect.isSupported && !typeToSelect.embeddedOnly) {
      browseStore.selectType(typeToSelect);
    }

    if (space || type) {
      navigate('/browse', { replace: true});
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space, type]);

  const classes = useStyles();

  return(
    <div className={classes.container}>
      <Types />
      <Instances/>
    </div>
  );
});
Browse.displayName = 'Browse';

export default Browse;