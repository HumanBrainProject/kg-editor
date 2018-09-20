import React from "react";
import { render } from "react-dom";
import { observer } from "mobx-react";
import { Router, Route, Switch, matchPath } from "react-router-dom";
import injectStyles from "react-jss";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserLock, faQuestionCircle, faHome, faSearch,
  faCaretRight, faCaretDown, faCircleNotch, faCircle, faTimes,
  faEdit, faProjectDiagram, faCloudUploadAlt, faChartBar } from "@fortawesome/free-solid-svg-icons";

import authStore from "./Stores/AuthStore";
import routerStore from "./Stores/RouterStore";
import instanceStore from "./Stores/InstanceStore";
import graphStore from "./Stores/GraphStore";

import Tab from "./Components/Tab";

import NotFound from "./Views/NotFound";
import Home from "./Views/Home";
import Login from "./Views/Login";
import Help from "./Views/Help";
import Statistics from "./Views/Statistics";
import Search from "./Views/Search";
import Instance from "./Views/Instance";
import Release from "./Views/Release";

import "babel-polyfill";

const styles = {
  "@global html, body, #root": {
    height: "100%",
    overflow: "hidden",
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-webkit-tap-highlight-color": "transparent",
    fontFamily:"Lato, sans-serif"
  },
  "@global *": {
    boxSizing: "border-box"
  },
  "@global button, @global input[type=button], @global a": {
    "-webkit-touch-callout": "none",
    userSelect: "none"
  },

  layout:{
    height: "100vh",
    display:"grid",
    overflow:"hidden",
    gridTemplateColumns:"1fr",
    gridTemplateRows:"auto 1fr 20px"
  },
  tabs: {
    background: "#141618",
    display:"grid",
    gridTemplateRows:"1fr",
    gridTemplateColumns:"auto auto 1fr auto"
  },
  fixedTabsLeft:{
    display:"grid",
    gridTemplateColumns:"repeat(6, auto)"
  },
  dynamicTabs:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit, minmax(120px, 0.5fr))"
  },
  fixedTabsRight:{
    display:"grid",
    gridTemplateColumns:"repeat(6, auto)"
  },
  body: {
    position: "relative",
    overflow:"hidden",
    background: "linear-gradient(165deg, #1C2022, #4895a4)",
    backgroundSize: "200%"
  },
  logo: {
    padding: "10px",
    "& span": {
      color: "rgb(224, 224, 224)",
      display: "inline-block",
      paddingLeft: "10px",
      fontSize: "0.9em",
      borderLeft: "1px solid rgba(255, 255, 255, 0.3)",
      marginLeft:"10px"
    }
  },
  status:{
    background: "#141618"
  }
};

@injectStyles(styles)
@observer
class App extends React.Component{
  constructor(props) {
    super(props);
    authStore.tryAuthenticate();
    this.state = {currentLocation: routerStore.history.location.pathname};
    routerStore.history.listen(location => {
      this.setState({currentLocation:location.pathname});
    });
  }

  handleCloseInstance(instanceId){
    if(matchPath(this.state.currentLocation, {path:"/instance/:id*", exact:"true"})){
      if(matchPath(this.state.currentLocation, {path:`/instance/${instanceId}`, exact:"true"})){
        if(instanceStore.openedInstances.size > 1){
          let openedInstances = Array.from(instanceStore.openedInstances.keys());
          let currentInstanceIndex = openedInstances.indexOf(instanceId);
          let newInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex-1]: openedInstances[currentInstanceIndex+1];

          routerStore.history.push("/instance/"+newInstanceId);
        } else {
          routerStore.history.push("/");
        }
      }
    }
    instanceStore.closeInstance(instanceId);
  }

  render(){
    const {classes} = this.props;
    const {currentLocation} = this.state;

    return(
      <Router history={routerStore.history}>
        <div className={classes.layout}>
          <div className={classes.tabs}>
            <div className={classes.logo}>
              <img src={`${window.rootPath}/assets/HBP.png`} alt="" width="30" height="30" />
              <span>Knowledge Graph Editor</span>
            </div>
            <div className={classes.fixedTabsLeft}>
              {!authStore.isAuthenticated?
                <Tab icon={"user-lock"} active={true}>Login</Tab>
                :
                <React.Fragment>
                  <Tab icon={"home"} active={matchPath(currentLocation, {path:"/", exact:"true"})} path={"/"}>Home</Tab>
                  <Tab icon={"search"} active={matchPath(currentLocation, {path:"/search", exact:"true"})} path={"/search"}>Search</Tab>
                </React.Fragment>
              }
            </div>
            <div className={classes.dynamicTabs}>
              {authStore.isAuthenticated && Array.from(instanceStore.openedInstances.keys()).map(instanceId => {
                const instance = instanceStore.getInstance(instanceId);
                let label = instanceId;
                let color = undefined;
                if(!instance.isFetching && !instance.hasFetchError){
                  label = instance.form.getField("http:%nexus-slash%%nexus-slash%schema.org%nexus-slash%name").getValue();
                  color = graphStore.colorScheme[instanceStore.nodeTypeMapping[instance.data.label]];
                }
                return (
                  <Tab
                    key={instanceId}
                    icon={instance.isFetching?"circle-notch":"circle"}
                    iconSpin={instance.isFetching}
                    iconColor={color}
                    active={matchPath(currentLocation, {path:`/instance/${instanceId}`, exact:"true"})}
                    path={`/instance/${instanceId}`}
                    onClose={this.handleCloseInstance.bind(this, instanceId)}>
                    {label}
                  </Tab>
                );
              })}
            </div>
            <div className={classes.fixedTabsRight}>
              <Tab icon={"chart-bar"} active={matchPath(currentLocation, {path:"/kg-stats", exact:"true"})} path={"/kg-stats"}>Stats</Tab>
              <Tab icon={"question-circle"} active={matchPath(currentLocation, {path:"/help", exact:"true"})} path={"/help"}>Help</Tab>
            </div>
          </div>
          <div className={classes.body}>
            {!authStore.isAuthenticated?
              <Route component={Login} />
              :
              <Switch>
                <Route path="/instance/:id*" component={Instance} />
                <Route path="/release/:id*" component={Release} />
                {/*<Route path="/graph/:id*" component={InstanceGraph} />*/}
                <Route path="/search" exact={true} component={Search} />
                <Route path="/help" exact={true} component={Help} />
                <Route path="/kg-stats" exact={true} component={Statistics} />
                <Route path="/" exact={true} component={Home} />
                <Route component={NotFound} />
              </Switch>
            }
          </div>
          <div className={classes.status}>

          </div>
        </div>
      </Router>
    );
  }
}

library.add(faUserLock, faQuestionCircle, faHome, faSearch, faCaretRight,
  faCaretDown, faCircleNotch, faCircle, faTimes, faEdit, faProjectDiagram, faCloudUploadAlt, faChartBar);

render(<App/>, document.getElementById("root"));
