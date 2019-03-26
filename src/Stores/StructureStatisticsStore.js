import { observable, action, runInAction, computed } from "mobx";
import API from "../Services/API";

class StructureStatisticsStore{

  @observable statistics = [];
  @observable isFetched = false;
  @observable isFetching = false;
  @observable fetchError = null;

  @action
  async fetchStatistics() {
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.statistics());
      runInAction(() => {
        this.isFetched = true;
        this.isFetching = false;
        this.statistics = data;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.fetchError = `Error while retrieving list of features (${message})`;
        this.isFetching = false;
      });
    }
  }

  @computed get nodeTypeStatistics() {
    let stats = [];
    if (this.statistics && this.statistics.nodes && this.statistics.nodes.length) {
      stats = Object.values(
        this.statistics.nodes
          .filter(node => node.group === "minds" && node.label && node.label.indexOf("Placomponent") === -1)
          .reduce((result, node) => {
            const [, type, version] = node.label.match(/(.+)\s\((.+)\)/);
            if (result[type]) {
              if (result[type].version < version) {
                const released = Math.round(Math.random() * node.numberOfInstances);
                const nodeType = result[type];
                nodeType.version = version;
                nodeType.released = released;
                nodeType.unreleased = node.numberOfInstances - released;
              }
            } else {
              const released = Math.round(Math.random() * node.numberOfInstances);
              result[type] = {
                nodeType: type,
                version: version,
                released: released,
                unreleased: node.numberOfInstances - released
              };
            }
            return result;
          }, {})
      )
        .sort((node1, node2) => node2.unreleased - node1.unreleased)
        .filter((node, index) => index < 10)
        .sort((node1, node2) => node1.unreleased - node2.unreleased);
    }
    return stats;
  }

  @computed get usersStatistics() {
    let stats = [];
    const users = ["Oliver Schmid", "Gilles Dénervaud", "David Kunzmann", "Benoît Beaumatin", "Rémi Diana", "Milica Markovic", "Katrin Amunts"];
    if (users.length) {
      stats = users
        .map(name => ({
          id: name,
          label: name,
          value: Math.round(Math.random() * 100)
        }))
        .sort((user1, user2) => user2.value - user1.value)
        .filter((user, index) => index < 5);
    }
    return stats;
  }

}

export default new StructureStatisticsStore();