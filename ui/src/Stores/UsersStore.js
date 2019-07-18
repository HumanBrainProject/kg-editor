import { observable, action, runInAction, computed } from "mobx";
import { debounce } from "lodash";

import API from "../Services/API";


class UsersStore {
  @observable users = new Map();

  @observable isFetchingSearch = false;
  @observable isSearchFetched = false;
  @observable searchFetchError = null;

  @observable searchResult = [];
  @observable searchFilter = {
    queryString: "",
    excludedUsers: []
  };

  @observable totalSearchCount = 0;

  searchPageStart = 0;
  searchPageSize = 20;


  //
  // Mockup Data
  //
  /*
  constructor() {
    this.users.set("305861", {
      id: "305861",
      username: "kunzmann",
      displayName: "David Kunzmann",
      givenName: "David",
      familyName: "Kunzmann",
      emails: [
        {
          primary: true
          value: "david.kunzmann@epfl.ch"
          verified: true
        }
      ],
      picture: "https://storage.humanbrainproject.eu/ppics/avatar/305861/d5cbce57-3435-4af2-bd76-ea1521290467.jpeg",
      isCurator: true,
      isFetching: false,
      isFetched: true,
      hasFetchError: false,
      fetchError: null
    });
    this.users.set("305670", {
      id: "305670",
      username: "gdenerva",
      displayName: "Gilles Dénervaud",
      givenName: "Gilles",
      familyName: "Dénervaud",
      emails: [
        {
          primary: true
          value: "gilles.denervaud@epfl.ch"
          verified: true
        }
      ],
      picture: "https://storage.humanbrainproject.eu/ppics/avatar/305670/4de3f5c8-6ee4-4499-a7e5-51b3cfeb2f7f.jpeg",
      isCurator: true,
      isFetching: false,
      isFetched: true,
      hasFetchError: false,
      fetchError: null
    });
    this.users.set("305629", {
      id: "305629",
      username: "oschmid",
      displayName: "Oliver Schmid",
      givenName: "Oliver",
      familyName: "Schmid",
      emails: [
        {
          primary: true
          value: ""oliver.schmid@epfl.ch"
          verified: true
        }
      ],
      picture: "https://storage.humanbrainproject.eu/ppics/avatar/305629/ffb8c644-c9a1-42da-a984-fb699e583b8a.jpeg",
      isCurator: true,
      isFetching: false,
      isFetched: true,
      hasFetchError: false,
      fetchError: null
    });
  }
  */

  @computed
  get hasSearchFilter() {
    return this.searchFilter.queryString !== "";
  }

  @action
  getUser(userId) {
    return this.users.get(userId);
  }

  @action
  addUser(user, clearSearch = false) {
    if (user && user.id && !this.users.has(user.id)) {
      this.users.set(user.id, Object.assign({}, user, {
        isFetching: false,
        isFetched: true,
        hasFetchError: false,
        fetchError: null
      }));
      if (clearSearch) {
        this.clearSearch();
      }
    }
  }

  @action
  async fetchUser(userId) {
    let user = this.users.get(userId);
    if (!user) {
      this.users.set(userId, {
        id: userId,
        username: null,
        displayName: null,
        givenName: null,
        familyName: null,
        emails: [],
        picture: null,
        isCurator: false,
        isFetching: false,
        isFetched: false,
        hasFetchError: false,
        fetchError: null
      });
      user = this.users.get(userId);
    }
    if (!user.isFetching && (!user.isFetched || user.hasFetchError)) {
      try {
        user.isFetching = true;
        user.hasFetchError = false;
        user.fetchError = null;
        const {data} = await API.axios.get(API.endpoints.userInfo(userId));
        runInAction(() => {
          const userData = data && data.data;
          user.username = userData && userData.username;
          user.displayName = userData && userData.displayName;
          user.givenName = userData && userData.givenName;
          user.familyName = userData && userData.familyName;
          user.emails = userData && userData.emails instanceof Array?userData.emails:[];
          user.picture = userData && userData.picture;
          user.isCurator = !!userData && !!userData.isCurator;
          user.isFetching = false;
          user.isFetched = true;
        });
      } catch (e) {
        runInAction(() => {
          user.username = null;
          user.displayName = null;
          user.givenName = null;
          user.familyName = null;
          user.emails = [];
          user.picture = null;
          user.isCurator = false;
          const error = e.message ? e.message : e;
          user.fetchError = `Error while retrieving user "${userId}" (${error})`;
          user.hasFetchError = true;
          user.isFetched = true;
          user.isFetching = false;
        });
      }
    }
    return user;
  }

  @action setSearchFilter(queryString, excludedUsers=[]){
    if (!queryString) {
      queryString = "";
    }
    queryString = queryString.trim(" ").toLowerCase();
    if (queryString === "") {
      this.clearSearch();
    } else if (queryString !== this.searchFilter.queryString) {
      this.searchFilter.queryString = queryString;
      this.searchFilter.excludedUsers = excludedUsers;
      this.isFetchingSearch = true;
      this.applySearchFilter();
    }
  }

  applySearchFilter = debounce(() => {
    this.searchUsers();
  }, 750);

  @computed
  get canLoadMoreResults() {
    if (!this.hasSearchFilter || this.isFetchingSearch || this.searchFetchError || !this.searchResult.length) {
      return false;
    }

    return this.searchResult.length < this.totalSearchCount;
  }

  @action
  clearSearch() {
    this.searchFilter.queryString = "";
    this.searchFilter.excludedUsers = [];
    this.searchResult = [];
    this.isSearchFetched = false;
    this.isFetchingSearch = false;
    this.totalSearchCount = 0;
  }

  @action
  async searchUsers(loadMore = false) {
    if (!this.hasSearchFilter) {
      this.clearSearch();
    } else {
      try {
        if (loadMore) {
          if (!this.searchFetchError) {
            this.searchPageStart++;
          }
        } else {
          this.searchPageStart = 0;
          this.searchResult = [];
        }
        this.isFetchingSearch = true;
        this.searchFetchError = null;

        const {data} = await API.axios.get(API.endpoints.reviewUsers(this.searchPageStart * this.searchPageSize, this.searchPageSize, this.searchFilter.queryString));
        runInAction(() => {
          if (!this.hasSearchFilter) {
            this.clearSearch();
          } else {
            this.isSearchFetched = true;
            this.isFetchingSearch = false;
            let result = [];
            if (loadMore) {
              result = [...this.searchResult, ...((data && data.data && data.data.users) ? data.data.users : [])];
            } else {
              result = (data && data.data && data.data.users) ? data.data.users : [];
            }
            if (this.searchFilter.excludedUsers && this.searchFilter.excludedUsers.length) {

              this.searchResult = result.filter(user => !this.searchFilter.excludedUsers.includes(user.id));
            } else {
              this.searchResult = result;
            }
            this.totalSearchCount = data.total !== undefined ? (data.total - (result.length - this.searchResult.length)) : 0;
          }
        });

        //
        // Mockup Data
        //
        /*
        const data = {
          "data": [
            {
              "id": "257059",
              "username": "sterratt",
              "givenName": "David",
              "familyName": "Sterratt",
              "displayName": "David Sterratt",
              "emails": [
                {
                  "value": "david.c.sterratt@ed.ac.uk",
                  "primary": true,
                  "verified": true
                }
              ],
              "picture": "https://storage.humanbrainproject.eu/ppics/avatar/257059/564414f8-d790-4182-ac71-0428dcd79410.jpeg",
              "isCurator": false
            },
            {
              "id": "263996",
              "username": "stokes",
              "givenName": "Alan",
              "familyName": "Stokes",
              "displayName": "Alan Stokes",
              "emails": [
                {
                  "value": "alan.stokes-2@manchester.ac.uk",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "305568",
              "username": "Stagsted",
              "givenName": "Rasmus Karnøe",
              "familyName": "Stagsted",
              "displayName": "Rasmus Karnøe Stagsted",
              "emails": [
                {
                  "value": "rasta13@student.sdu.dk",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "264211",
              "username": "stothart",
              "givenName": "Clare Elizabeth",
              "familyName": "Stothart",
              "displayName": "Clare Elizabeth Stothart",
              "emails": [
                {
                  "value": "clare.stothart@epfl.ch",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "302492",
              "username": "stanley",
              "givenName": "Stanley ",
              "familyName": "Durrleman",
              "displayName": "Stanley  Durrleman",
              "emails": [
                {
                  "value": "stanley.durrleman@inria.fr",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "301399",
              "username": "Stoilova",
              "givenName": "Emilija",
              "familyName": "Stoilova",
              "displayName": "Emilija Stoilova",
              "emails": [
                {
                  "value": "emilija.stoilova@epfl.ch",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "306871",
              "username": "stefan",
              "givenName": "Stefan",
              "familyName": "Grigore",
              "displayName": "Stefan Grigore",
              "emails": [
                {
                  "value": "stefan.grigore@student.manchester.ac.uk",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "306531",
              "username": "stradmann",
              "givenName": "Yannik",
              "familyName": "Stradmann",
              "displayName": "Yannik Stradmann",
              "emails": [
                {
                  "value": "yannik.stradmann@kip.uni-heidelberg.de",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "258421",
              "username": "stauss",
              "givenName": "Maximilian",
              "familyName": "Stauss",
              "displayName": "Maximilian Stauss",
              "emails": [
                {
                  "value": "stauss@fzi.de",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "306597",
              "username": "steidel",
              "givenName": "Jörg",
              "familyName": "Steidel",
              "displayName": "Jörg Steidel",
              "emails": [
                {
                  "value": "joerg.steidel@kip.uni-heidelberg.de",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "255976",
              "username": "ulbrich",
              "givenName": "Stefan",
              "familyName": "Ulbrich",
              "displayName": "Stefan Ulbrich",
              "emails": [
                {
                  "value": "stefan.ulbrich@fzi.de",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "244517",
              "username": "masoli",
              "givenName": "Stefano",
              "familyName": "Masoli",
              "displayName": "Stefano Masoli",
              "emails": [
                {
                  "value": "stefano.masoli@epfl.ch",
                  "primary": true,
                  "verified": true
                }
              ],
              "picture": "https://storage.humanbrainproject.eu/ppics/avatar/244517/7e363b17-c79d-4d14-b079-2b7399aaa056.jpeg",
              "isCurator": false
            },
            {
              "id": "246998",
              "username": "scasali",
              "givenName": "Stefano",
              "familyName": "Casali",
              "displayName": "Stefano Casali",
              "emails": [
                {
                  "value": "scasali84@gmail.com",
                  "primary": true,
                  "verified": true
                },
                {
                  "value": "stefano.casali@unipv.it",
                  "primary": false,
                  "verified": true
                }
              ],
              "picture": "https://storage.humanbrainproject.eu/ppics/avatar/246998/36202cda-d554-4729-85b3-b64652dd08c5.jpeg",
              "isCurator": false
            },
            {
              "id": "307022",
              "username": "Sfrancio",
              "givenName": "Stefano",
              "familyName": "Francione",
              "displayName": "Stefano Francione",
              "emails": [
                {
                  "value": "stefano.francione@gmail.com",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "302261",
              "username": "stivenne",
              "givenName": "Stine",
              "familyName": "Vennemo",
              "displayName": "Stine Vennemo",
              "emails": [
                {
                  "value": "stine.brekke.vennemo@nmbu.no",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "307283",
              "username": "cstoeckl",
              "givenName": "Christoph",
              "familyName": "Stöckl",
              "displayName": "Christoph Stöckl",
              "emails": [
                {
                  "value": "christoph.stoeckl@student.tugraz.at",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            },
            {
              "id": "306509",
              "username": "stepaniuk",
              "givenName": "Andrey",
              "familyName": "Stepanyuk",
              "displayName": "Andrey Stepanyuk",
              "emails": [
                {
                  "value": "andrii.stepaniuk@epfl.ch",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "257054",
              "username": "grillner",
              "givenName": "Sten",
              "familyName": "Grillner",
              "displayName": "Sten Grillner",
              "emails": [
                {
                  "value": "sten.grillner@ki.se",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "263956",
              "username": "sdehaene",
              "givenName": "Stanislas",
              "familyName": "Dehaene",
              "displayName": "Stanislas Dehaene",
              "emails": [
                {
                  "value": "stanislas.dehaene@cea.fr",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": false
            },
            {
              "id": "307144",
              "username": "nerveway",
              "givenName": "Stamelos",
              "familyName": "Loutsos",
              "displayName": "Stamelos Loutsos",
              "emails": [
                {
                  "value": "stamloutsos@gmail.com",
                  "primary": true,
                  "verified": true
                }
              ],
              "isCurator": true
            }
          ],
          "total": 20
        };
        const reg = new RegExp(this.searchFilter.queryString.toLowerCase());
        const result = (data && data.data && this.searchFilter.queryString !== "")?data.data.filter(user => reg.test(user.displayName.toLowerCase())):[];
        if (this.searchFilter.excludedUsers && this.searchFilter.excludedUsers.length) {
          this.searchResult = result.filter(user => !this.searchFilter.excludedUsers.includes(user.id));
        } else {
          this.searchResult = result;
        }
        this.totalSearchCount = data.total;
        this.isSearchFetched = true;
        this.isFetchingSearch = false;
        */

      } catch (e) {
        runInAction(() => {
          if (!this.hasSearchFilter) {
            this.clearSearch();
          } else {
            const message = e.message ? e.message : e;
            this.searchFetchError = `Error while searching users (${message})`;
            this.isSearchFetched = true;
            this.isFetchingSearch = false;
          }
        });
      }
    }
  }
}

export default new UsersStore();