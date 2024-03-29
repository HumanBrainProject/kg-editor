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

import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';
import {faUserPlus} from '@fortawesome/free-solid-svg-icons/faUserPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../../../Hooks/useStores';
import User from './User';

import type { UserSummary } from '../../../../types';
import type { ChangeEvent, MouseEvent} from 'react';

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    width: '100%',
    color: 'var(--ft-color-normal)',
    '& .errorPanel, & .spinnerPanel': {
      color: 'var(--ft-color-loud)',
      '& svg path': {
        stroke: 'var(--ft-color-loud)',
        fill: 'var(--ft-color-quiet)'
      }
    }
  },
  search:{
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    padding: '0 22px 6px 0',
    position: 'relative'
  },
  searchInput:{
    width: 'calc(100% - 36px)',
    margin: '0 0 0 26px',
    padding: '10px 12px 14px 35px',
    border: '1px solid transparent',
    borderRadius: '2px',
    backgroundColor: 'var(--bg-color-blend-contrast1)',
    color: 'var(--ft-color-loud)',
    '&:focus': {
      borderColor: 'rgba(64, 169, 243, 0.5)',
      backgroundColor: 'var(--bg-color-blend-contrast1)',
      color: 'var(--ft-color-normal)'
    },
    '&.disabled,&:disabled': {
      backgroundColor: 'var(--bg-color-blend-contrast1)'
    }
  },
  searchDropdown: {
    '& .dropdown-menu': {
      display: 'block',
      width: 'calc(100% - 58px)',
      margin: '50px 0 0 27px',
      padding: 0,
      left: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      '& .dropdown-list': {
        maxHeight: '33vh',
        overflowY: 'auto',
        '& ul': {
          position: 'static',
          float: 'none',
          listStyleType: 'none',
          margin: 0,
          padding: 0
        }
      }
    },
    '&.open':{
      display:'block'
    },
    '&:not(.open)':{
      '& .dropdown-menu': {
        borderColor: 'transparent',
        boxShadow: 'none'
      }
    }
  },
  addIcon: {
    position: 'absolute',
    top: '15px',
    left: '2px',
    color: 'var(--ft-color-normal)'
  },
  searchIcon:{
    position: 'absolute',
    top: '15px',
    left: '40px',
    color: 'var(--ft-color-normal)'
  },
  footerPanel: {
    display: 'flex',
    padding: '6px',
    fontSize: '0.9rem',
    color: '#555'
  },
  searchCount:{
    flex: 1,
    textAlign: 'right'
  },
  errorPanel: {
    display: 'flex',
    width: '100%',
    margin: 0,
    padding: '6px',
    border: 0,
    background: '#ffa18f',
    fontSize: '0.9rem',
    color: 'black',
    outline: 0,
    '& .error': {
      width: 'calc(100% - 20px)',
      color: '#ff0029',
      textAlign: 'left',
      wordBreak: 'keep-all',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },
    '& .retry': {
      flex: 1,
      textAlign: 'right'
    }
  }
});

interface SearchProps {
  excludedUsers: string[];
  onSelect: (userId: string) => void;
}

const Search = observer(({ excludedUsers, onSelect }: SearchProps) => {

  const wrapperRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const classes = useStyles();

  const { userStore } = useStores();

  useEffect(() => {
    const clickOutHandler = (e:MouseEvent | Event) => {
      if(!wrapperRef.current?.contains(e.target as Node)){
        userStore.clearSearch();
      }
    };

    window.addEventListener('mouseup', clickOutHandler, false);
    window.addEventListener('touchend', clickOutHandler, false);
    window.addEventListener('keyup', clickOutHandler, false);

    return () => {
      window.removeEventListener('mouseup', clickOutHandler, false);
      window.removeEventListener('touchend', clickOutHandler, false);
      window.removeEventListener('keyup', clickOutHandler, false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadSearchResults = () => userStore.searchUsers();

  const handleSelect = (user: UserSummary, event: React.KeyboardEvent<HTMLDivElement> |  MouseEvent<HTMLElement>) => {
    const e = event as unknown as KeyboardEvent;
    if(e &&  e.key === 'ArrowDown'){ // Down
      event.preventDefault();
      const users = usersRef.current?.querySelectorAll('.option');
      if (users?.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        (users[index] as HTMLDivElement).focus();
      }
    } else if(e && e.key === 'ArrowUp'){ // Up
      event.preventDefault();
      const users = usersRef.current?.querySelectorAll('.option');
      if (users?.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        (users[index] as HTMLDivElement).focus();
      }
    } else if(e && e.key === 'Escape') { //escape
      event.preventDefault();
      userStore.clearSearch();
    } else if (user && (!event || (e &&  (!e.key || e.key === 'Enter')))) { // enter
      event.preventDefault();
      inputRef.current?.focus();
      onSelect(user.id);
    }
  };

  const handleInputKeyStrokes = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event && event.key === 'ArrowDown' ){ // Down
      event.preventDefault();
      const users = usersRef.current?.querySelectorAll('.option');
      if (users?.length) {
        let index = Array.prototype.indexOf.call(users, event.target) + 1;
        if (index >= users.length) {
          index = 0;
        }
        (users[index] as HTMLDivElement).focus();
      }
    } else if(event && event.key === 'ArrowUp'){ // Up
      event.preventDefault();
      const users = usersRef.current?.querySelectorAll('.option');
      if (users?.length) {
        let index = Array.prototype.indexOf.call(users, event.target) - 1;
        if (index < 0) {
          index = users.length - 1;
        }
        (users[index] as HTMLDivElement).focus();
      }
    } else if(event && event.key === 'Escape') { //escape
      event.preventDefault();
      userStore.clearSearch();
    }
  };

  const handleSearchFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const event = e as unknown as KeyboardEvent;
    if (event.key !== 'ArrowDown'   // Down
      && event.key !== 'ArrowUp'   // Up
      && event.key !== 'Escape') { //escape
      userStore.setSearchFilter(e.target.value, excludedUsers);
    }
  };

  const showTotalSearchCount = userStore.isSearchFetched && userStore.totalSearchCount !== undefined && (!userStore.searchFetchError || userStore.totalSearchCount !== 0);

  return (
    <div className={classes.container} ref={wrapperRef} >
      <FontAwesomeIcon icon={faUserPlus} className={classes.addIcon} />
      <div className={classes.search}>
        <input ref={inputRef} className={`form-control ${classes.searchInput}`} placeholder="Invite a user for review" type="text" value={userStore.searchFilter.queryString} onKeyDown={handleInputKeyStrokes} onChange={handleSearchFilterChange} />
        <FontAwesomeIcon icon={faSearch} className={classes.searchIcon} />
        <div className={`${classes.searchDropdown} ${userStore.hasSearchFilter?'open':''}`} ref={usersRef}>
          <div className="dropdown-menu">
            <div className="dropdown-list">
              {userStore.searchResult.map(user => (
                <User key={user.id} user={user} onSelect={handleSelect} />
              ))}
            </div>
            { (userStore.isFetchingSearch || showTotalSearchCount) && (
              <div className={classes.footerPanel} >
                <div>
                  { userStore.isFetchingSearch && (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} spin />&nbsp;&nbsp; retrieving...
                    </>
                  )}
                </div>
                <div className={classes.searchCount}>
                  { showTotalSearchCount && (
                    <>
                      {userStore.totalSearchCount} user{`${userStore.totalSearchCount > 1?'s':''} found`}
                    </>
                  )}
                </div>
              </div>
            )}
            {userStore.searchFetchError && (
              <button className={classes.errorPanel} title={userStore.searchFetchError} onClick={handleLoadSearchResults}>
                <div className="error"><FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;&nbsp;<span>{userStore.searchFetchError}</span></div>
                <div className="retry"><FontAwesomeIcon icon={faRedoAlt}/></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
Search.displayName = 'Search';

export default Search;