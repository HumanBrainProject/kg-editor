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

import { observable, action, computed, runInAction, set, values, makeObservable } from 'mobx';
import type API from '../Services/API';
import type { GraphGroup, GraphGroups, GraphLink, GraphLinks, GraphNode, GraphNodes, GraphSource, GraphTarget, SimpleType, UUID } from '../types';
import { APIError } from '../Services/API';

const typeDefaultColor = 'white';
const typeDefaultName = '-';
const typeDefaultLabel = 'Unknown';

const getGroupId = (types: SimpleType[]) => types.map(t => t.name).join('|');

const getGroupName = (types: SimpleType[]) => types.map(t => t.label).join(', ');

const getColor = (types: SimpleType[]) => types[0].color?types[0].color:typeDefaultColor;

const createGroup = (id: string, types: SimpleType[]) => ({
  id: id,
  name: getGroupName(types),
  color: getColor(types),
  isGroup: true,
  types: types,
  nodes: [],
  show: true,
  grouped: false,
  highlighted: false
});

const createNode = (id: UUID, name: string, space: string, color: string, groupId: string) => ({
  id: id,
  name: name?name:id,
  space: space,
  color: color,
  groupId: groupId,
  highlighted: false
});

const createLink = (id: string, source: GraphSource, target: GraphTarget) => ({
  id: id,
  source: source,
  target: target
});

const isNodeVisible = (groups: GraphGroups, node) => {
  if(node.isGroup) {
    if (node.grouped) {
      return node.show;
    }
  } else {
    const group = groups[node.groupId];
    if (!group.grouped) {
      return group.show;
    }
  }
  return false;
};

const getGraphNodes = (groups: GraphGroups) => Object.values(groups).reduce((acc, group) => {
  if (group.show) {
    if (group.grouped) {
      acc.push(group);
    } else {
      acc.push(...group.nodes);
    }
  }
  return acc;
}, []);

const getGraphLinks = (groups: GraphGroups, links: GraphLink[]) => links.filter(link => isNodeVisible(groups, link.source) && isNodeVisible(groups, link.target)).map(link => ({
  id: link.id,
  source: link.source,
  target: link.target
}));

export class GraphStore {
  isFetching = false;
  isFetched = false;
  fetchError?: string;
  mainId?: string;
  groups: GraphGroups = {};
  nodes: GraphNodes = {};
  links: GraphLink[] = [];
  highlightedNode?: GraphNode;

  api: API;

  constructor(api: API) {
    makeObservable(this, {
      isFetching: observable,
      isFetched: observable,
      fetchError: observable,
      mainId: observable,
      groups: observable,
      nodes: observable,
      links: observable,
      highlightedNode: observable,
      groupsList: computed,
      fetch: action,
      reset: action,
      setHighlightNodeConnections: action,
      setGroupVisibility: action,
      setGrouping: action,
      extractGroupsAndLinks: action,
      graphDataNodes: computed,
      graphDataLinks: computed
    });

    this.api = api;
  }

  get graphDataNodes() {
    return getGraphNodes(this.groups);
  }

  get graphDataLinks() {
    return getGraphLinks(this.groups, this.links);
  }

  get groupsList() {
    return values(this.groups).sort((a, b) => a.name.localeCompare(b.name));
  }

  async fetch(id: UUID) {
    if (this.isFetching) {
      return;
    }
    this.fetchError = undefined;
    this.isFetched = false;
    this.isFetching = true;
    this.highlightedNode = undefined;
    this.nodes = {};
    this.groups = {};
    this.links = [];
    try {
      const { data } = await this.api.getInstanceNeighbors(id);
      runInAction(() => {
        this.mainId = id;
        this.extractGroupsAndLinks(data);
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        this.fetchError = err?.message;
        this.isFetching = false;
      });
    }
  }

  reset() {
    this.isFetched = false;
    this.isFetching = false;
    this.groups = {};
    this.links = [];
    this.mainId = undefined;
  }

  setHighlightNodeConnections(node: GraphNode, highlighted=false) {
    this.highlightedNode = highlighted?node:undefined;
    if(node) {
      set(node, 'highlighted', highlighted);
    }
    this.links.forEach(link => {
      set(link.source, 'highlighted', false);
      set(link.target, 'highlighted', false);
    });
    if (node && highlighted) {
      this.graphDataLinks.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          set(link.source, 'highlighted', true);
          set(link.target, 'highlighted', true);
        }
      });
    }
  }

  setGroupVisibility(group: GraphGroup, show=true) {
    set(group, 'show', show);
  }

  setGrouping(group: GraphGroup, grouped=true) {
    set(group, 'grouped', grouped);
  }

  extractGroupsAndLinks = rootData => {
    const links: GraphLinks = {};

    const getOrCreateNode = (id: string, name: string, space: string, group: GraphGroup) => {
      let node = this.nodes[id];
      if (!node) {
        set(this.nodes, id, createNode(id, name, space, group.color, group.id));
        node = this.nodes[id];
        group.nodes.push(node);
        if (group.nodes.length > 1) { // by default we group nodes when more than one
          group.grouped = true;
        }
      }
      return node;
    };

    const getOrCreateGroup = types => {
      const groupId = getGroupId(types);
      let group = this.groups[groupId];
      if (!group) {
        set(this.groups, groupId, createGroup(groupId, types));
        group = this.groups[groupId];
      }
      return group;
    };

    const addDirectionalLink = (source: GraphSource, target: GraphTarget) => {
      const id = `${source.id}->${target.id}`;
      if (!links[id]) {
        links[id] = createLink(id, source, target);
      }
    };

    const addLink = (source: GraphSource, target: GraphTarget, isReverse?: boolean) => {
      if (isReverse) {
        addDirectionalLink(target, source); //NOSONAR swap of target & source order are intended, it is reverse
      } else {
        addDirectionalLink(source, target);
      }
    };

    const extractData = (data, parentNode?: GraphNode, parentGroup?: GraphGroup, isReverse?: boolean) => {
      const types = (data.types && data.types.length)?data.types:[{name: typeDefaultName, label: typeDefaultLabel}];
      const group = getOrCreateGroup(types);
      const node = getOrCreateNode(data.id, data.name, data.space, group);

      if (!parentNode) {
        node.isMainNode = true;
      }

      if (parentNode) {
        addLink(node, parentNode, isReverse);
        addLink(group, parentNode, isReverse);
      }
      if (parentGroup) {
        addLink(node, parentGroup, isReverse);
        addLink(group, parentGroup, isReverse);
      }

      Array.isArray(data.inbound) && data.inbound.forEach(child => extractData(child, node, group, false));
      Array.isArray(data.outbound) && data.outbound.forEach(child => extractData(child, node, group, true));
    };

    extractData(rootData, undefined, undefined, false);

    values(this.groups).forEach(group => group.nodes = group.nodes.sort((a, b) => (a.name?a.name:a.id).localeCompare(b.name?b.name:b.id)));

    this.links =  Object.values(links);
  };
}

export default GraphStore;