import { observable, action, runInAction } from "mobx";
import API from "../Services/API";
import console from "../Services/Logger";

import {find, remove, clone, pullAll, uniqueId, uniq, flatten} from "lodash";

import palette from "google-palette";

const nodeTypeWhitelist = [
  "http://hbp.eu/minds#Dataset",
  "http://hbp.eu/minds#SpecimenGroup",
  "http://hbp.eu/minds#ExperimentSubject",
  "http://hbp.eu/minds#Activity",
  "http://hbp.eu/minds#Person",
  "http://hbp.eu/minds#PLAComponent",
  "http://hbp.eu/minds#Publication",
  "http://hbp.eu/minds#FileAssociation",
  "http://hbp.eu/minds#DatasetDOI",
  "http://hbp.eu/minds#ExperimentMethod",
  "http://hbp.eu/minds#ReferenceSpace",
  "http://hbp.eu/minds#ParcellationRegion",
  "http://hbp.eu/minds#ParcellationAtlas",
  "http://hbp.eu/minds#EmbargoStatus",
  "http://hbp.eu/minds#EthicsApproval",
  "http://hbp.eu/minds#ExperimentProtocol",
  "http://hbp.eu/minds#Preparation",
  "http://hbp.eu/minds#EthicsAuthority",
  "http://hbp.eu/minds#Format",
  "http://hbp.eu/minds#LicenseInformation",
  "http://hbp.eu/minds#ExperimentSample",
  "http://hbp.eu/minds#File",
  "http://hbp.eu/minds#Subject"
];

const colorScheme = {};

let colorTable = palette("mpn65", nodeTypeWhitelist.length).map(color => "#"+color);
nodeTypeWhitelist.forEach((type, index) => {colorScheme[type] = colorTable[index];});

class GraphStore {
  @observable step = 2;
  @observable sidePanel = false;
  @observable typeStates = null;
  @observable expandedTypes = [];
  @observable isFetching = false;
  @observable isFetched = false;
  @observable mainId = null;

  originalData = null;
  groupNodes = null;
  highlightedNode = null;
  connectedNodes = null;
  connectedLinks = null;

  get colorScheme(){
    return colorScheme;
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
      const { data } = await API.axios.get(API.endpoints.graph(id, this.step));
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
    remove(this.originalData.nodes, node => nodeTypeWhitelist.indexOf(node.dataType) === -1);
    remove(this.originalData.links, link => !find(this.originalData.nodes, node => node.id === link.source) || !find(this.originalData.nodes, node => node.id === link.target));

    //Transform links source and target reference to actual node objects
    this.originalData.links.forEach(link => {
      link.source = find(this.originalData.nodes, node => node.id === link.source);
      link.target = find(this.originalData.nodes, node => node.id === link.target);
    });
    this.originalData.nodes.forEach(node => {
      node.niceDataType = node.dataType.replace("http://hbp.eu/minds#","");
      node.isMainNode = node.id.includes(this.mainId);

      console.log(this.mainId);
      if(node.isMainNode){
        console.log(this.mainId);
      }
    });

    this.groupNodes = new Map();
    this.typeStates = new Map();
    //Create group nodes
    nodeTypeWhitelist.forEach(nodeType => {
      let nodesOfType = this.findNodesByType(nodeType);
      if(nodesOfType.length <= 1){
        this.typeStates.set(nodeType, nodesOfType.length===1?"show":"none");
        return;
      }

      let groupNode = {
        id:"Group_"+nodeType,
        dataType:"Group_"+nodeType,
        name:"Group_"+nodeType,
        title:"Group of "+nodeType.replace("http://hbp.eu/minds#","")+" ("+nodesOfType.length+")",
        original_dataType:nodeType,
        isGroup:true,
        groupSize: nodesOfType.length
      };

      this.groupNodes.set(nodeType, groupNode);
      this.typeStates.set(nodeType, "group");
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

  @action setStep(step){
    this.step = step;
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

  get nodeTypeWhitelist(){
    return nodeTypeWhitelist;
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