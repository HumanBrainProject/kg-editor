import { observable, action, runInAction } from "mobx";

import API from "../Services/API";

class UsersStore{
  @observable users = new Map();
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
      isFetching: false,
      isFetched: true,
      hasFetchError: false,
      fetchError: null
    });
  }
  */

 @action
  getUser(userId) {
    return this.users.get(userId);
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
       const { data } = await API.axios.get(API.endpoints.userInfo(userId));
       runInAction(() => {
         user.username = data.username;
         user.displayName = data.displayName;
         user.givenName = data.givenName;
         user.familyName = data.familyName;
         user.emails = data.emails instanceof Array?data.emails:[];
         user.picture = data.picture;
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
         const error = e.message?e.message:e;
         user.fetchError = `Error while retrieving user "${userId}" (${error})`;
         user.hasFetchError = true;
         user.isFetched = true;
         user.isFetching = false;
       });
     }
   }
   return user;
 }
}

export default new UsersStore();