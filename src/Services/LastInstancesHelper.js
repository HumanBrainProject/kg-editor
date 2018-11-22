
const lastInstancesMaxItems = 10;

const nodeTypesToMonitor = [
  "Dataset"
];

const createEmptyLastInstancesObject = () => {
  return nodeTypesToMonitor.reduce((result, nodeType) => {
    result[nodeType.toLowerCase()] = [];
    return result;
  }, {});
};

export const retrieveLastInstances = key => {
  if (!key) {
    return createEmptyLastInstancesObject();
  }
  let lastInstances = {};
  if (localStorage.getItem(key)) {
    try {
      lastInstances = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      lastInstances = createEmptyLastInstancesObject();
    }
  } else {
    lastInstances = createEmptyLastInstancesObject();
  }
  return lastInstances;
};

export const updateLastInstances = (key, instanceId, remove) => {
  let lastInstances = !key?createEmptyLastInstancesObject():retrieveLastInstances(key);
  let [,,nodeType,,] = (typeof instanceId === "string")?instanceId.split("/"):[null, null, null, null, null];
  if (!nodeType) {
    return lastInstances;
  }
  nodeType = nodeType.toLowerCase();
  if (nodeTypesToMonitor.map(n => n.toLowerCase()).indexOf(nodeType) === -1) {
    return lastInstances;
  }
  let list = (lastInstances[nodeType] && lastInstances[nodeType].length)?lastInstances[nodeType]:[];
  const index = list.indexOf(instanceId);
  if (index !== -1) {
    list.splice(index, 1);
  } else if (list.length >= lastInstancesMaxItems) {
    list.pop();
  }
  if (!remove) {
    list.unshift(instanceId);
  }
  lastInstances[nodeType] = list;
  localStorage.setItem(key, JSON.stringify(lastInstances));
  return lastInstances;
};