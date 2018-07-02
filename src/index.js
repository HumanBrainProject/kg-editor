import React from "react";
import { render } from "react-dom";
import { observer, Provider } from "mobx-react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import injectStyles from "react-jss";

import authStore from "./Stores/AuthStore";
import NavigationStore from "./Stores/NavigationStore";
import Login from "./Views/Login";
import Home from "./Views/Home";
import NotFound from "./Views/NotFound";
import Search from "./Views/Search";
import NodeType from "./Views/NodeType";
import Instance from "./Views/Instance";
import Menu from "./Views/Menu";
import "babel-polyfill";


const styles = {
  "@global html, @global body, @global #root": {
    height: "100%",
    overflow: "hidden"
  },
  "@global *": {
    boxSizing: "border-box"
  },
  "@global button, @global input[type=button], @global a": {
    "-webkit-touch-callout": "none",
    userSelect: "none"
  },
  container:{
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-webkit-tap-highlight-color": "transparent",
    fontFamily:"Lato, sans-serif",
    height: "100vh"
  },
  body: {
    position: "relative",
    height: "100vh",
    width: "100vw",
    overflow:"hidden",
    background: `url(${window.rootPath}/assets/hbp_home.jpg) center center no-repeat #154979`,
    backgroundSize: "cover",
    "@media screen and (min-width:576px)": {
      display: "block"
    }
  },
  logo: {
    position: "absolute",
    top: "0",
    left: "0",
    padding: "10px",
    "& h1": {
      display: "inline-block",
      margin: 0,
      paddingLeft: "10px",
      verticalAlign: "middle",
      color: "white",
      fontSize: "18px",
      "@media screen and (min-width:750px)":{
        fontSize: "28px"
      }
    }
  },
  menu: {
    zIndex: "100",
    position: "absolute",
    top: "80px",
    width: "100vw",
    "@media screen and (min-width:750px)": {
      top: "10px",
      right: "10px",
      width: "auto"
    }
  }
};

@injectStyles(styles)
@observer
class App extends React.Component{
  constructor(props) {
    super(props);
    authStore.tryAuthenticate();
    this.navigationStore = new NavigationStore();
  }
  render(){
    let {classes} = this.props;
    return(
      <Provider navigationStore={this.navigationStore}>
        <BrowserRouter basename={window.rootPath}>
          <div className={classes.container}>
            {!authStore.isAuthenticated?
              <Route component={Login} />
              :
              <div className={classes.body}>
                <div className={classes.logo}>
                  <img src={`${window.rootPath}/assets/HBP.png`} alt="" width="60" height="60" />
                  <h1>Knowledge Graph Editor</h1>
                </div>
                <div className={classes.menu}>
                  <Menu />
                </div>
                <Switch>
                  <Route path="/instance/:id*" component={Instance} />
                  <Route path="/nodetype/:id*" component={NodeType} />
                  <Route path="/search" exact={true} component={Search} />
                  <Route path="/" exact={true} component={Home} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            }
          </div>
        </BrowserRouter>
      </Provider>
    );
  }
}

render(<App/>, document.getElementById("root"));
