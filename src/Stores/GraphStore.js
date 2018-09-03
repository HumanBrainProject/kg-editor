import { observable, action, runInAction } from "mobx";
import API from "../Services/API";
import console from "../Services/Logger";

import {find, remove, clone, pullAll, uniqueId, uniq, flatten, union} from "lodash";

import palette from "google-palette";

const nodeTypeWhitelist = [
  "Dataset",
  "SpecimenGroup",
  "ExperimentSubject",
  "Activity",
  "Person",
  "PLAComponent",
  "Publication",
  "FileAssociation",
  "DatasetDOI",
  "ExperimentMethod",
  "ReferenceSpace",
  "ParcellationRegion",
  "ParcellationAtlas",
  "EmbargoStatus",
  "EthicsApproval",
  "ExperimentProtocol",
  "Preparation",
  "EthicsAuthority",
  "Format",
  "LicenseInformation"
];

const colorScheme = {};

let colorTable = palette("mpn65", nodeTypeWhitelist.length).map(color => "#"+color);
nodeTypeWhitelist.forEach((type, index) => {colorScheme[type] = colorTable[index];});

export default class GraphStore {
  @observable breadCrumbs = [];
  @observable network;
  @observable step = 2;
  @observable selectedNode;

  @observable dataChanged = 0;
  graphData = null;
  originalData = null;
  groupNodes = null;
  highlightedNode = null;
  connectedNodes = null;
  connectedLinks = null;

  constructor(instanceStore){
    this.instanceStore = instanceStore;
  }

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
    this.highlightedNode = node;
    this.connectedNodes = this.findConnectedNodes(node);
    this.connectedLinks = this.findLinksByNode(node);
  }

  @action async fetchGraph(id) {
    try {
      const { data } = await API.axios.get(API.endpoints.graph(id, this.step));
      runInAction( ()=>{
        this.originalData = data;
        this.setSelectedNode(find(this.originalData.nodes), node => node.id === id);
        this.filterOriginalData();
        this.computeGraphData();
        this.dataChanged++;
      } );
    } catch (e) {
      console.log(e);
    }
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

    this.groupNodes = new Map();

    //Create group nodes
    nodeTypeWhitelist.forEach(nodeType => {
      let nodesOfType = this.findNodesByType(nodeType);
      if(nodesOfType.length <= 1){
        return;
      }

      let groupNode = {
        id:"Group_"+nodeType,
        dataType:"Group_"+nodeType,
        name:"Group_"+nodeType,
        title:"Group of "+nodeType+" ("+nodesOfType.length+")",
        original_dataType:nodeType,
        isGroup:true,
        groupSize: nodesOfType.length
      };

      this.groupNodes.set(nodeType, groupNode);
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

  @action computeGraphData(){
    this.graphData = {
      nodes:[...this.originalData.nodes],
      links:[...this.originalData.links]
    };

    this.groupNodes.forEach(groupNode => {
      pullAll(this.graphData.nodes, this.findNodesByType(groupNode.original_dataType));
      pullAll(this.graphData.links, this.findLinksByType(groupNode.original_dataType));
    });
  }

  @action explodeNode(clickedNode) {
    if(clickedNode.isGroup){
      pullAll(this.graphData.nodes, [clickedNode]);
      remove(this.graphData.links, link => link.source === clickedNode || link.target === clickedNode);

      this.graphData.nodes = union(this.graphData.nodes, this.findNodesByType(clickedNode.original_dataType));
      this.graphData.links = union(this.graphData.links, this.findLinksByType(clickedNode.original_dataType).filter(link => find(this.graphData.nodes, link.source) && find(this.graphData.nodes, link.target)));
    }
    this.dataChanged++;
  }

  @action setStep(step){
    this.step = step;
  }

  @action setSelectedNode(node){
    let arr = this.breadCrumbs.peek();
    arr.push(node);
    this.setBreadCrumbs(arr);
    this.selectedNode = node;
  }

  get breadCrumbs(){
    return this.breadCrumbs.peek();
  }

  @action setBreadCrumbs(b){
    this.breadCrumbs = b;
  }

  @action handleNavigationClick(index){
    if(this.breadCrumbs && this.breadCrumbs.length > 0){
      let temp = [];
      for(let i = 0; i < index + 1; i++){
        temp.push(this.breadCrumbs[i]);
      }
      let node = temp[temp.length -1];
      this.setBreadCrumbs(temp);
      this.updateGraph(node.id);
    }
  }
}