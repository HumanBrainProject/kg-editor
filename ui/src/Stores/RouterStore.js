import { createBrowserHistory } from "history";


class RouterStore{
  history = createBrowserHistory({basename:window.rootPath});
}

export default new RouterStore();