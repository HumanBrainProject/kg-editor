/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { observable, action, computed, runInAction, set, values, makeObservable } from "mobx";

import API from "../Services/API";
import appStore from "./AppStore";

const typeDefaultColor = "white";
const typeDefaultName = "-";
const typeDefaultLabel = "Unknown";

const getGroupId = types => types.map(t => t.name).join("|");

const getGroupName = types => types.map(t => t.label).join(", ");

const getColor = types => types[0].color?types[0].color:typeDefaultColor;

const createGroup = (id, types) => ({
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

const createNode = (id, name, workspace, color, groupId) => ({
  id: id,
  name: name?name:id,
  workspace: workspace,
  color: color,
  groupId: groupId,
  highlighted: false
});

const createLink = (id, source, target) => ({
  id: id,
  source: source,
  target: target,
  highlighted: false
});

const isNodeVisible = (groups, node) => {
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

const getGraphNodes = groups => Object.values(groups).reduce((acc, group) => {
  if (group.show) {
    if (group.grouped) {
      acc.push(group);
    } else {
      acc.push(...group.nodes);
    }
  }
  return acc;
}, []);

const getGraphLinks = (groups, links) => links.filter(link => isNodeVisible(groups, link.source) && isNodeVisible(groups, link.target));

class GraphStore {
  isFetching = false;
  isFetched = false;
  fetchError = null;
  mainId = null;
  groups = {};
  nodes = {};
  links = [];
  highlightedNode = null;

  constructor() {
    makeObservable(this, {
      isFetching: observable,
      isFetched: observable,
      fetchError: observable,
      mainId: observable,
      groups: observable,
      nodes: observable,
      links: observable,
      highlightedNode: observable,
      graphData: computed,
      groupsList: computed,
      fetch: action,
      reset: action,
      setHighlightNodeConnections: action,
      setGroupVisibility: action,
      setGrouping: action
    });
  }

  get graphData() {
    return {
      nodes: getGraphNodes(this.groups),
      links: getGraphLinks(this.groups, this.links)
    };
  }

  get groupsList() {
    return values(this.groups).sort((a, b) => a.name.localeCompare(b.name));
  }

  async fetch(id) {
    this.fetchError = null;
    this.isFetched = false;
    this.isFetching = true;
    this.highlightedNode = null;
    this.nodes = {};
    this.groups = {};
    this.links = [];
    try {
      const { data } = await API.axios.get(API.endpoints.neighbors(id));
      runInAction(() => {
        this.mainId = id;
        this.extractGroupsAndLinks(data.data);
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch (e) {
      runInAction(() => {
        this.fetchError = e.message ? e.message : e;
        this.isFetching = false;
      });
      appStore.captureSentryException(e);
    }
  }

  reset() {
    this.isFetched = false;
    this.isFetching = false;
    this.groups = {};
    this.links = [];
    this.mainId = null;
  }

  setHighlightNodeConnections(node, highlighted=false) {
    this.highlightedNode = highlighted?node:null;
    if(node) {
      set(node, "highlighted", highlighted);
    }
    this.links.forEach(link => {
      set(link.source, "highlighted", false);
      set(link.target, "highlighted", false);
      set(link, "highlighted", false);
    });
    if (node && highlighted) {
      this.graphData.links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          set(link.source, "highlighted", true);
          set(link.target, "highlighted", true);
          set(link, "highlighted", true);
        }
      });
    }
  }

  setGroupVisibility(group, show=true) {
    set(group, "show", show);
  }

  setGrouping(group, grouped=true) {
    set(group, "grouped", grouped);
  }

  extractGroupsAndLinks = data => {
    const links = {};

    const getOrCreateNode = (id, name, workspace, group) => {
      let node = this.nodes[id];
      if (!node) {
        set(this.nodes, id, createNode(id, name, workspace, group.color, group.id));
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

    const addDirectionalLink = (source, target) => {
      const id = `${source.id}->${target.id}`;
      if (!links[id]) {
        links[id] = createLink(id, source, target);
      }
    };

    const addLink = (source, target, isReverse) => {
      if (isReverse) {
        addDirectionalLink(target, source);
      } else {
        addDirectionalLink(source, target);
      }
    };

    const extractData = (data, parentNode, parentGroup, isReverse) => {
      const types = (data.types && data.types.length)?data.types:[{name: typeDefaultName, label: typeDefaultLabel}];
      const group = getOrCreateGroup(types);
      const node = getOrCreateNode(data.id, data.name, data.workspace, group);

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

    extractData(data, null, null, false);

    values(this.groups).forEach(group => group.nodes = group.nodes.sort((a, b) => (a.name?a.name:a.id).localeCompare(b.name?b.name:b.id)));

    this.links =  Object.values(links);
  };
}

export default new GraphStore();