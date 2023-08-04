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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import { createUseStyles } from 'react-jss';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { ReactNode } from 'react';

const useStyles = createUseStyles({
  container:{
    position:'absolute !important',
    top:'50%',
    left:'50%',
    transform:'translate(-50%,-200px)',
    textAlign:'center'
  },
  icon:{
    fontSize:'10em',
    '& path':{
      fill:'var(--bg-color-blend-contrast1)',
      stroke:'rgba(200,200,200,.1)',
      strokeWidth:'3px'
    }
  },
  text:{
    fontWeight:'300',
    fontSize:'1.2em'
  }
});

interface BGMessageProps {
  icon?: IconProp;
  children: ReactNode;
  transform?: string;
  className?: string;
}

const BGMessage = ({ icon, transform, children, className }: BGMessageProps) => {
  const classes = useStyles();
  return(
    <div className={`${classes.container} ${className?className:''}`}>
      {icon && (
        <div className={classes.icon}>
          <FontAwesomeIcon icon={icon} transform={transform}/>
        </div>
      )}
      <div className={classes.text}>
        {children}
      </div>
    </div>
  );
};

export default BGMessage;