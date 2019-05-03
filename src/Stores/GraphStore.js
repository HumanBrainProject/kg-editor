import { observable, action, computed, runInAction } from "mobx";
import API from "../Services/API";
import console from "../Services/Logger";

import {find, remove, clone, pullAll, uniqueId, uniq, flatten} from "lodash";

import palette from "google-palette";

const nodeTypes = [
  {
    "label": "Dataset",
    "type": "https://schema.hbp.eu/minds/Dataset"
  },
  {
    "label": "Specimen group",
    "type": "https://schema.hbp.eu/minds/Specimengroup"
  },
  {
    "label": "Subject",
    "type": "https://schema.hbp.eu/minds/Subject"
  },
  {
    "label": "Activity",
    "type": "https://schema.hbp.eu/minds/Activity"
  },
  {
    "label": "Person",
    "type": "https://schema.hbp.eu/minds/Person"
  },
  {
    "label": "PLA Component",
    "type": "https://schema.hbp.eu/minds/Placomponent"
  },
  {
    "label": "Publication",
    "type": "https://schema.hbp.eu/minds/Publication"
  },
  {
    "label": "File Association",
    "type": "https://schema.hbp.eu/minds/FileAssociation"
  },
  {
    "label": "DOI",
    "type": "https://schema.hbp.eu/minds/DatasetDOI"
  },
  {
    "label": "Method",
    "type": "https://schema.hbp.eu/minds/Method"
  },
  {
    "label": "Reference space",
    "type": "https://schema.hbp.eu/minds/Referencespace"
  },
  {
    "label": "Parcellation Region",
    "type": "https://schema.hbp.eu/minds/Parcellationregion"
  },
  {
    "label": "Parcellation Atlas",
    "type": "https://schema.hbp.eu/minds/Parcellationatlas"
  },
  {
    "label": "Embargo Status",
    "type": "https://schema.hbp.eu/minds/Embargostatus"
  },
  {
    "label": "Approval",
    "type": "https://schema.hbp.eu/minds/Approval"
  },
  {
    "label": "Protocol",
    "type": "https://schema.hbp.eu/minds/Protocol"
  },
  {
    "label": "Preparation",
    "type": "https://schema.hbp.eu/minds/Preparation"
  },
  {
    "label": "Authority",
    "type": "https://schema.hbp.eu/minds/Authority"
  },
  {
    "label": "Format",
    "type": "https://schema.hbp.eu/minds/Format"
  },
  {
    "label": "License Type",
    "type": "https://schema.hbp.eu/minds/Licensetype"
  },
  {
    "label": "Sample",
    "type": "https://schema.hbp.eu/minds/ExperimentSample"
  },
  {
    "label": "File",
    "type": "https://schema.hbp.eu/minds/File"
  },
  {
    "label": "Software agent",
    "type": "https://schema.hbp.eu/minds/Softwareagent"
  },
  {
    "label": "Age category",
    "type": "https://schema.hbp.eu/minds/Agecategory"
  },
  {
    "label": "Sex",
    "type": "https://schema.hbp.eu/minds/Sex"
  },
  {
    "label": "Species",
    "type": "https://schema.hbp.eu/minds/Species"
  },
  {
    "label": "Role",
    "type": "https://schema.hbp.eu/minds/Role"
  }
];

class GraphStore {
  @observable sidePanel = false;
  @observable typeStates = null;
  @observable expandedTypes = [];
  @observable isFetching = false;
  @observable isFetched = false;
  @observable mainId = null;
  @observable nodeTypes = nodeTypes;

  originalData = null;
  groupNodes = null;
  highlightedNode = null;
  connectedNodes = null;
  connectedLinks = null;

  @computed
  get sortedNodeTypes(){
    return this.nodeTypes.concat().sort((a, b) => a.type < b.type?-1: a.type > b.type?1:0);
  }

  @computed
  get nodeTypeLabels(){
    return this.nodeTypes.reduce((result, nodeType) => {
      result[nodeType.type] = nodeType.label;
      return result;
    }, {});
  }

  @computed
  get colorScheme(){
    const colorPalette = palette("mpn65", this.nodeTypes.length);
    return this.nodeTypes.reduce((result, type, index) => {
      result[type.label] = "#" + colorPalette[index];
      return result;
    },{});
  }

  findNodesByType(type){
    return this.originalData.nodes.filter(node => node.dataType === type);
  }

  findLinksBySourceType(type){
    return this.originalData.links.filter(link => link.source.dataType === type);
  }

  findLinksByTargetType(type){
    return this.originalData.links.filter(link => link.target.dataType === type);
  }

  findLinksByType(type){
    return this.originalData.links.filter(link => link.source.dataType === type || link.target.dataType === type);
  }

  findLinksBySourceAndTarget(sourceNode, targetNode){
    return this.originalData.links.filter(link => link.source === sourceNode && link.target === targetNode);
  }

  findLinksByNode(node){
    return this.originalData.links.filter(link => link.source === node || link.target === node);
  }

  findConnectedNodes(node){
    return uniq(flatten(this.findLinksByNode(node).map(link => [link.target, link.source])));
  }

  @action hlNode(node){
    if(node !== null && this.typeStates.get(node.dataType) === "group"){
      node = this.groupNodes.get(node.dataType);
    }
    this.highlightedNode = node;
    this.connectedNodes = node !== null? this.findConnectedNodes(node): [];
    this.connectedLinks = node !== null? this.findLinksByNode(node): [];
  }

  @action async fetchGraph(id) {
    this.isFetched = false;
    this.isFetching = true;
    try {
      const { data } = await API.axios.get(API.endpoints.graph(id));
      runInAction( ()=>{
        this.mainId = id;
        this.originalData = data;
        this.filterOriginalData();
        this.expandedTypes = [];
        this.isFetched = true;
        this.isFetching = false;
      } );
    } catch (e) {
      console.log(e);
    }
  }

  @action reset(){
    this.isFetched = false;
    this.isFetching = false;
    this.expandedTypes = [];
    this.originalData = null;
    this.groupNodes = null;
    this.highlightedNode = null;
    this.connectedNodes = null;
    this.connectedLinks = null;
    this.mainId = null;
  }

  @action filterOriginalData(){
    //Remove nodes that are not whitelisted
    remove(this.originalData.nodes, node => !this.nodeTypes.some(nodeType => nodeType.type === node.dataType));
    remove(this.originalData.links, link => !find(this.originalData.nodes, node => node.id === link.source) || !find(this.originalData.nodes, node => node.id === link.target));

    //Transform links source and target reference to actual node objects
    this.originalData.links.forEach(link => {
      link.source = find(this.originalData.nodes, node => node.id === link.source);
      link.target = find(this.originalData.nodes, node => node.id === link.target);
    });
    this.originalData.nodes.forEach(node => {
      node.dataTypeLabel = this.nodeTypeLabels[node.dataType]; //node.dataType.replace("https://schema.hbp.eu/minds/","");
      node.isMainNode = node.id.includes(this.mainId);
    });

    this.groupNodes = new Map();
    this.typeStates = new Map();
    //Create group nodes
    this.nodeTypes.forEach(nodeType => {
      let nodesOfType = this.findNodesByType(nodeType.type);
      if(nodesOfType.length <= 1){
        this.typeStates.set(nodeType.type, nodesOfType.length===1?"show":"none");
        return;
      }

      let groupNode = {
        id:"Group_"+nodeType.type,
        dataType:"Group_"+nodeType.type,
        name:"Group_"+nodeType.type,
        title:"Group of "+nodeType.label+" ("+nodesOfType.length+")",
        original_dataType:nodeType.type,
        dataTypeLabel:nodeType.label,
        isGroup:true,
        groupSize: nodesOfType.length
      };

      this.groupNodes.set(nodeType.type, groupNode);
      this.typeStates.set(nodeType.type, "group");
      this.originalData.nodes.push(groupNode);
    });

    this.originalData.links.forEach(link => {
      let sourceGroupNode = this.groupNodes.get(link.source.dataType);
      let targetGroupNode = this.groupNodes.get(link.target.dataType);

      if(sourceGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, link.target).length === 0){
        let newLink = clone(link);
        newLink.source =  sourceGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if(targetGroupNode && this.findLinksBySourceAndTarget(link.source, targetGroupNode).length === 0){
        let newLink = clone(link);
        newLink.target =  targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
      if(sourceGroupNode && targetGroupNode && this.findLinksBySourceAndTarget(sourceGroupNode, targetGroupNode).length === 0){
        let newLink = clone(link);
        newLink.source =  sourceGroupNode;
        newLink.target =  targetGroupNode;
        newLink.id = uniqueId("groupnode-link");
        this.originalData.links.push(newLink);
      }
    });
  }

  get graphData(){
    if(this.typeStates === null || this.originalData === null){
      return null;
    }

    let graphData = {
      nodes:[...this.originalData.nodes],
      links:[...this.originalData.links]
    };

    this.typeStates.forEach((state, type)=>{
      if(state === "group" || state === "hide"){
        pullAll(graphData.nodes, this.findNodesByType(type));
        pullAll(graphData.links, this.findLinksByType(type));
      }
      if(state === "show" || state === "hide"){
        pullAll(graphData.nodes, this.findNodesByType("Group_"+type));
        pullAll(graphData.links, this.findLinksByType("Group_"+type));
      }
    });

    return graphData;
  }

  @action explodeNode(clickedNode) {
    if(clickedNode.isGroup){
      this.typeStates.set(clickedNode.original_dataType, "show");
    }
  }

  @action toggleSettingsPanel(state){
    if(state === undefined){
      this.sidePanel = this.sidePanel === "settings"?"":"settings";
    } else {
      if(state){
        this.sidePanel = "settings";
      } else {
        this.sidePanel = "";
      }
    }
  }

  @action setTypeState(nodeType, state){
    this.typeStates.set(nodeType, state);
  }

  @action expandType(typeToExpand){
    this.expandedTypes.push(typeToExpand);
  }

  @action collapseType(typeToCollapse){
    remove(this.expandedTypes, type => typeToCollapse === type);
  }

  @action toggleType(typeToToggle){
    if(find(this.expandedTypes, type => typeToToggle === type)){
      this.collapseType(typeToToggle);
    } else {
      this.expandType(typeToToggle);
    }
  }

  getCurrentNode(){
    return find(this.originalData.nodes, node => node.id === this.instanceStore.mainInstanceId);
  }
}

export default new GraphStore();