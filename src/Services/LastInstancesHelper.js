
const maxItems = 100;

export const retrieveLastInstances = key => {
  if (!key) {
    return [];
  }
  let lastInstances = [];
  if (localStorage.getItem(key)) {
    try {
      lastInstances = JSON.parse(localStorage.getItem(key));
      if (!(lastInstances instanceof Array)) {
        lastInstances = [];
      }
    } catch (e) {
      lastInstances = [];
    }
  } else {
    lastInstances = [];
  }
  return lastInstances;
};

export const updateLastInstances = (key, instanceId, remove) => {
  let lastInstances = !key?[]:retrieveLastInstances(key);
  let [,,nodeType,,] = (typeof instanceId === "string")?instanceId.split("/"):[null, null, null, null, null];
  if (!nodeType) {
    return lastInstances;
  }
  nodeType = nodeType.toLowerCase();
  let index = -1;
  lastInstances.some((instance, idx) => {
    if (instance.id === instanceId) {
      index = idx;
      return true;
    }
    return false;
  });
  if (index !== -1) {
    lastInstances.splice(index, 1);
  } else if (lastInstances.length >= maxItems) {
    lastInstances.pop();
  }
  if (!remove) {
    lastInstances.unshift({id: instanceId, type: nodeType});
  }
  localStorage.setItem(key, JSON.stringify(lastInstances));
  return lastInstances;
};