import createBrowserHistory from "history/createBrowserHistory";

class RouterStore{
  history = createBrowserHistory({basename:window.rootPath});
}

export default new RouterStore();