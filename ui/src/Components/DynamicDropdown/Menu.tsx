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
import InfiniteScroll from 'react-infinite-scroller';
import { createUseStyles } from 'react-jss';

import MenuItems from './MenuItems';
import type { Suggestion } from '../../types';

const useStyles = createUseStyles({
  container:{
    display:'block',
    position: 'absolute',
    top: '100%',
    left: '0',
    width:'100%',
    maxHeight:'33vh',
    zIndex: '1000',
    float: 'left',
    overflowY:'auto',
    minWidth: '160px',
    padding: '5px 0',
    margin: '2px 0 0',
    fontSize: '14px',
    textAlign: 'left',
    backgroundColor: '#fff',
    backgroundClip: 'padding-box',
    border: '1px solid rgba(0,0,0,.15)',
    borderRadius: '4px',
    boxShadow: '0 6px 12px rgba(0,0,0,.175)'
  },
  menu:{
    position:'static',
    display:'block',
    float:'none',
    width:'100%',
    background:'none',
    border:'none',
    boxShadow:'none',
    padding: 0,
    margin:0
  }
});

interface MenuProps {
  current: Suggestion|null;
  hasMore: boolean;
  onLoadMore: () => void;
  searchTerm: string;
  items: Suggestion[];
  loading: boolean;
  onSelect: (item: Suggestion) => void;
  onSelectNext: (item: Suggestion) => void;
  onSelectPrevious: (item: Suggestion) => void;
  onCancel: () => void;
}

const Menu = ({
  current,
  hasMore,
  onLoadMore,
  searchTerm,
  items,
  loading,
  onSelect,
  onSelectNext,
  onSelectPrevious,
  onCancel
}: MenuProps) => {

  const classes = useStyles();

  return(
    <div className={classes.container}>
      <InfiniteScroll
        className={classes.menu}
        threshold={100}
        hasMore={hasMore}
        loadMore={onLoadMore}
        useWindow={false}>
        <MenuItems
          current={current}
          searchTerm={searchTerm}
          items={items}
          loading={loading}
          hasMore={hasMore}
          onSelect={onSelect}
          onSelectNext={onSelectNext}
          onSelectPrevious={onSelectPrevious}
          onCancel={onCancel}
        />
      </InfiniteScroll>
    </div>

  );
};

export default Menu;