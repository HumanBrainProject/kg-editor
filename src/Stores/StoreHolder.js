let stores = new Map();

class StoreHolder{
  addStore(id, store){
    stores.set(id, store);
  }

  getStore(id){
    return stores.get(id);
  }
}

export default new StoreHolder();