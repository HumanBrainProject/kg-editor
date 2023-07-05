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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Color from 'color';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';
import MultiToggle from '../../../Components/MultiToggle';

import useStores from '../../../Hooks/useStores';

const useStyles = createUseStyles({
  container: {
    height: '100%'
  },
  groups: {

  },
  group: {
    position: 'relative',
    height: '45px',
    padding: '0 10px',
    '&:nth-child(odd)': {
      background: 'var(--bg--color-ui-contrast3)'
    },
    overflow: 'hidden',
    transition: 'height 0.25s ease-in-out',
    '&.expanded': {
      height: 'auto',
      '& $expandButton': {
        transform: 'rotateZ(90deg)'
      }
    },
    '&.disabled': {
      opacity: '0.2',
      display: 'none'
    }
  },
  groupActions: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    fontSize: '1.25em'
  },
  groupLabel: {
    lineHeight: '45px',
    color: 'var(--ft-color-normal)',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--ft-color-loud)'
    }
  },
  typeIcon: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    margin: '0 4px 2px 8px',
    borderRadius: '50%',
    background: 'white',
    border: '2px solid gray',
    verticalAlign: 'middle',
    zIndex: 2
  },
  nodes: {
    paddingBottom: '10px',
    paddingLeft: '30px'
  },
  node: {
    padding: '5px 0',
    position: 'relative',
    cursor: 'pointer',
    color: 'var(--ft-color-normal)',
    '&:hover': {
      color: 'var(--ft-color-loud)'
    },
    '&::before': {
      content: '\'\'',
      display: 'block',
      position: 'absolute',
      left: -23,
      top: -15,
      height: 32,
      width: 1,
      borderLeft: '1px dashed #bdc3c7'
    },
    '&::after': {
      content: '\'\'',
      display: 'block',
      position: 'absolute',
      left: -22,
      top: 16,
      width: '17px',
      height: 1,
      borderBottom: '1px dashed #bdc3c7'
    }
  },
  expandButton: {
    color: '#bdc3c7',
    cursor: 'pointer',
    transition: 'transform 0.25s ease-in-out'
  }
});

const Node = ({ node, isGrouped }) => {

  const classes = useStyles();

  const { appStore, graphStore, userProfileStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  const handelMouseOver = () => graphStore.setHighlightNodeConnections(node, true);

  const handelMouseOut = () => graphStore.setHighlightNodeConnections(node, false);

  const handleClick = () => {
    if (node.id !== graphStore.mainId) {
      graphStore.reset();
      if(node.space !== appStore.currentSpace.id) {
        const space = userProfileStore.getSpaceInfo(node.space);
        if(space.permissions.canRead) {
          appStore.switchSpace(location, navigate, node.space);
          navigate(`/instances/${node.id}/graph`);
        }
      } else {
        navigate(`/instances/${node.id}/graph`);
      }
    }
  };

  let actions = {onClick: handleClick};
  if(!isGrouped) {
    actions = {
      onMouseOver: handelMouseOver,
      onMouseOut: handelMouseOut,
      onClick: handleClick
    };
  }

  return (
    <div className={classes.node} {...actions}>{node.name} {node.space !== appStore.currentSpace.id? <em style={{color:'var(--ft-color-error)'}}>(Space: {node.space})</em> : null}</div>
  );
};

const Nodes = ({className, nodes, isGrouped}) => (
  <div className={className}>
    {nodes.map(node => (
      <Node key={node.id} node={node} isGrouped={isGrouped} />
    ))}
  </div>
);

const TypeIcon= ({color, grouped}) => {
  const classes = useStyles();
  const style = {
    borderRadius: grouped?'0':'50%',
    background: color,
    borderColor: new Color(color).darken(0.25).hex()
  };

  return (
    <div className={classes.typeIcon} style={style} />
  );
};

const Type = ({type, defaultColor, grouped}) => (
  <span>
    <TypeIcon color={type.color?type.color:defaultColor} grouped={grouped} />
    {type.label}
  </span>
);

const GroupLabel = observer(({ className, group }) => {

  const { graphStore } = useStores();

  let actions = {};
  if(group.grouped) {
    actions = {
      onMouseOver: () => graphStore.setHighlightNodeConnections(group, true),
      onMouseOut: () => graphStore.setHighlightNodeConnections(group, false)
    };
  }

  return (
    <span className={className}  {...actions}>
      {group.types.map(type => (
        <Type key={type.name} type={type} grouped={group.grouped} />
      ))}
    </span>
  );
});
GroupLabel.displayName = 'GroupLabel';

const Actions = observer(({ className, group }) => {

  const { graphStore } = useStores();

  const handleChange = action => {
    switch (action) {
    case 'show':
      graphStore.setGroupVisibility(group, true);
      break;
    case 'hide':
      graphStore.setGroupVisibility(group, false);
      break;
    case 'group':
      graphStore.setGrouping(group, true);
      break;
    case 'ungroup':
      graphStore.setGrouping(group, false);
      break;
    default:
      break;
    }
  };

  let value = group.show?'show':'hide';
  let actions = [
    {value: 'show', icon:'eye'},
    {value: 'hide', icon:'eye-slash'}
  ];
  if (group.show && group.nodes.length > 1) {
    value = group.grouped?'group':'ungroup';
    actions = [
      {value: 'group',   icon: 'compress'},
      {value: 'ungroup', icon: 'expand-arrows-alt'},
      {value: 'hide',    icon: 'eye-slash'}
    ];
  }

  return (
    <div className={className}>
      <MultiToggle selectedValue={value} onChange={handleChange}>
        {actions.map(action => (
          <MultiToggle.Toggle key={action.value} color={'var(--ft-color-loud)'} value={action.value} icon={action.icon} />
        ))}
      </MultiToggle>
    </div>
  );
});
Actions.displayName = 'Actions';

const Group = ({ group }) => {

  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`${classes.group} ${expanded ? 'expanded' : ''}`}>
      <FontAwesomeIcon icon="arrow-right" className={classes.expandButton} onClick={handleClick} />
      <GroupLabel className={classes.groupLabel} group={group} />
      <Actions className={classes.groupActions} group={group} />
      {expanded && (
        <Nodes className={classes.nodes} nodes={group.nodes} isGrouped={group.grouped} />
      )}
    </div>
  );
};

const Groups = ({className, groups}) => (
  <div className={className}>
    {groups.map(group => (
      <Group key={group.id} group={group} />
    ))}
  </div>
);

const GraphSettings = observer(() => {

  const classes = useStyles();

  const { graphStore } = useStores();

  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        {graphStore.isFetched && (
          <Groups className={classes.groups} groups={graphStore.groupsList} />
        )}
      </Scrollbars>
    </div>
  );
});
GraphSettings.displayName = 'GraphSettings';

export default GraphSettings;