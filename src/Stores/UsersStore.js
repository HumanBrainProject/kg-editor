import { observable, action, runInAction } from "mobx";
import { isArray, debounce } from "lodash";

//import API from "../Services/API";

class UsersStore{
  @observable users = new Map();
  @observable isFetching = false;

  processSize = 20;
  fetchQueue = [];
  fetchErrorQueue = [];

  getUser(id){
    return this.users.get(id);
  }

  @action
  fetchUsers(userIds){
    if(!isArray(userIds)){
      userIds = [userIds];
    }
    userIds.forEach(id => {
      if(!this.users.has(id) || this.users.get(id).hasFetchError){
        this.users.set(id, {
          id: id,
          name: null,
          picture: null,
          isFetching: false,
          isFetched: false,
          hasFetchError: false,
          fetchError: null
        });
        this.fetchQueue.push(id);
      }
    });
    this.smartProcessQueue();
  }

  @action
  retryfetchUsers(){
    const toFetch = this.fetchErrorQueue;
    this.fetchErrorQueue = [];
    this.fetchUsers(toFetch);
  }

  @action
  smartProcessQueue(){
    if(this.fetchQueue.length <= 0){
      this._debouncedProcessQueue.cancel();
    } else if(this.fetchQueue.length < this.processSize){
      this._debouncedProcessQueue();
    } else {
      this._debouncedProcessQueue.cancel();
      this.processQueue();
    }
  }

  _debouncedProcessQueue = debounce(()=>{this.processQueue();}, 250);

  @action
  async processQueue(){
    if(this.isFetching){
      return;
    }
    this.isFetching = true;
    let toProcess = this.fetchQueue.splice(0, this.processSize);
    toProcess.forEach(id => {
      this.users.get(id).isFetching = true;
    });
    try{
      /*
      const { data } = await API.axios.post(API.endpoints.users(), toProcess);
      runInAction(() =>{
        const users = Array.isArray(data.data)?data.data:[];
        users.forEach(userData => {
          const user = this.users.get(userData.id);
          if (userData.error) {
            user.hasFetchError = true;
            const error = (userData.error.message?userData.error.message:"") + (userData.error.code?`(code ${userData.error.code})`:"");
            user.fetchError = `Error while fetching user "${userData.id}" (${error})`;
            user.name = null;
            user.picture = null;
          } else {
            user.name = userData.name;
            user.picture = userData.picture;
            user.hasFetchError = false;
            user.fetchError = null;
          }
          user.isFetching = false;
          user.isFetched = true;
        });
        this.isFetching = false;
        this.smartProcessQueue();
      });
      */
      //
      // Mockup Data
      //
      /*
      const users = [
        {
          name: "Amunts, Katrin"
        },
        {
          name: "Weber, Bruno"
        },
        {
          name: "Graber, Steffen",
          picture: "https://storage.humanbrainproject.eu/ppics/avatar/269421/81d7dd0e-3d00-4756-aa09-67ea97231ad4.jpeg"
        },
        {
          name: "Bjaalie, Jan G."
        }
      ];
      const data = {
        data: toProcess.map((id, idx) => {
          const index = (idx % users.length);
          const user = users[index];
          if ((Math.floor(Math.random() * 10 + idx) % 5) === 0) {
            return {
              id: id,
              error: {
                message: `Failed to request user "${id}"`,
                code: "501"
              }
            };
          }
          return {
            id: id,
            name: user.name,
            picture: user.picture
          };
        })
      };
      */
      //
      // Mockup Data
      //
      const data = {
        data: [
          {
            id: "305861",
            name: "David Kunzmann",
            picture: "https://pbs.twimg.com/profile_images/834400378812821504/8OXxtm6R_400x400.jpg"
          },
          {
            id: "305670",
            name: "Gilles Dénervaud",
            picture: "https://storage.humanbrainproject.eu/ppics/avatar/305670/4de3f5c8-6ee4-4499-a7e5-51b3cfeb2f7f.jpeg"
          },
          {
            id: "305629",
            name: "Oliver Schmid",
            picture: "https://storage.humanbrainproject.eu/ppics/avatar/305629/ffb8c644-c9a1-42da-a984-fb699e583b8a.jpeg"
          }
        ]
      };
      setTimeout(() => {
        runInAction(() =>{
          const usersData = Array.isArray(data.data)?data.data:[];
          usersData.forEach(userData => {
            const user = this.users.get(userData.id);
            if (userData.error) {
              user.hasFetchError = true;
              const error = (userData.error.message?userData.error.message:"") + (userData.error.code?`(code ${userData.error.code})`:"");
              user.fetchError = `Error while fetching user "${userData.id}" (${error})`;
            } else {
              user.name = userData.name;
              user.picture = userData.picture;
            }
            user.isFetching = false;
            user.isFetched = true;
          });
          this.isFetching = false;
          this.smartProcessQueue();
        });
      }, 500);
    } catch(e){
      runInAction(() =>{
        const message = e.message?e.message:e;
        toProcess.forEach(id => {
          const user = this.users.get(id);
          user.isFetching = false;
          user.hasFetchError = true;
          user.fetchError = `Error while fetching user "${id}" (${message})`;
        });
        this.fetchErrorQueue.push(...toProcess);
        this.isFetching = false;
        this.smartProcessQueue();
      });
    }
  }
}

export default new UsersStore();