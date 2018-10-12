import React from "react";
import { render } from "react-dom";
import { observer } from "mobx-react";
import { Router, Route, Switch, matchPath } from "react-router-dom";
import injectStyles from "react-jss";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserLock, faQuestionCircle, faHome, faSearch, faCamera,
  faCaretRight, faCaretDown, faCircleNotch, faCircle, faTimes, faUndo, faSave, faSyncAlt,
  faEdit, faProjectDiagram, faCloudUploadAlt, faChartBar, faCodeBranch, faPencilAlt, faEye, faExclamationTriangle, faUnlink, faBan, faRedoAlt, faMoneyCheck, faThumbsUp, faCheck, faFile, faPlus, faDotCircle, faArrowRight, faExpandArrowsAlt, faCompress, faEyeSlash, faExclamationCircle, faEnvelope, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

import appStore from "./Stores/AppStore";
import authStore from "./Stores/AuthStore";
import routerStore from "./Stores/RouterStore";
import instanceStore from "./Stores/InstanceStore";
import graphStore from "./Stores/GraphStore";

import Tab from "./Components/Tab";
import SaveBar from "./Views/Instance/SaveBar";

import NotFound from "./Views/NotFound";
import Home from "./Views/Home";
import Login from "./Views/Login";
import Help from "./Views/Help";
import Statistics from "./Views/Statistics";
import Search from "./Views/Search";
import Instance from "./Views/Instance";

import "babel-polyfill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GlobalError from "./Views/GlobalError";

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
    background: "var(--bg-color-ui-contrast1)",
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
    background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    backgroundSize: "200%"
  },
  logo: {
    padding: "10px",
    "& span": {
      color: "var(--ft-color-loud)",
      display: "inline-block",
      paddingLeft: "10px",
      fontSize: "0.9em",
      borderLeft: "1px solid var(--border-color-ui-contrast5)",
      marginLeft:"10px"
    }
  },
  status:{
    background: "var(--bg-color-ui-contrast1)"
  },
  savebar:{
    position:"absolute",
    top:0,
    right:"-400px",
    width:"400px",
    background:"var(--bg-color-ui-contrast3)",
    borderLeft:"1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-loud)",
    height:"100%",
    zIndex:2,
    transition:"right 0.25s ease",
    "&.show":{
      right:"0",
    }
  },
  savebarToggle:{
    cursor:"pointer",
    position:"absolute",
    bottom:"10px",
    right:"100%",
    background:"linear-gradient(90deg, var(--bg-color-ui-contrast1), var(--bg-color-ui-contrast3))",
    borderRadius:"3px 0 0 3px",
    padding:"10px",
    border:"1px solid var(--border-color-ui-contrast1)",
    borderRight:"none",
    textAlign:"center",
    color:"#e67e22",
    "&:hover":{
      background:"var(--bg-color-ui-contrast3)"
    }
  },
  savebarToggleIcon:{
    animation: "pulse 2s linear infinite"
  },
  "@keyframes pulse": {
    "0%":{
      "transform": "scale(1.1)"
    },
    "50%":{
      "transform": "scale(0.8)"
    },
    "100%":{
      "transform": "scale(1.1)"
    }
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

  componentDidMount(){
    document.addEventListener("keydown", this.handleGlobalShortcuts);
  }

  componentDidCatch(error, info){
    appStore.setGlobalError(error, info);
  }

  handleGlobalShortcuts = (e) => {
    if((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === 84){
      appStore.toggleTheme();
    } else if(e.altKey && e.keyCode === 87){
      let matchInstanceTab = matchPath(this.state.currentLocation, {path:"/instance/:mode/:id*", exact:"true"});
      if(matchInstanceTab){
        this.handleCloseInstance(matchInstanceTab.params.id);
      }
    }
  }

  handleToggleSaveBar = () => {
    instanceStore.toggleSavebarDisplay();
  }

  handleCloseInstance(instanceId){
    if(matchPath(this.state.currentLocation, {path:"/instance/:mode/:id*", exact:"true"})){
      if(matchPath(this.state.currentLocation, {path:`/instance/:mode/${instanceId}`, exact:"true"})){
        if(instanceStore.openedInstances.size > 1){
          let openedInstances = Array.from(instanceStore.openedInstances.keys());
          let currentInstanceIndex = openedInstances.indexOf(instanceId);
          let newInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex-1]: openedInstances[currentInstanceIndex+1];

          let openedInstance = instanceStore.openedInstances.get(newInstanceId);
          routerStore.history.push(`/instance/${openedInstance.viewMode}/${newInstanceId}`);
        } else {
          routerStore.history.push("/search");
        }
      }
    }
    instanceStore.closeInstance(instanceId);
  }

  render(){
    const {classes} = this.props;
    const {currentLocation} = this.state;
    const Theme = appStore.availableThemes[appStore.currentTheme];

    return(
      <Router history={routerStore.history}>
        <div className={classes.layout}>
          <Theme/>
          <div className={classes.tabs}>
            <div className={classes.logo}>
              <img src={`${window.rootPath}/assets/HBP.png`} alt="" width="30" height="30" />
              <span>Knowledge Graph Editor</span>
            </div>

            {!appStore.globalError &&
              <React.Fragment>
                <div className={classes.fixedTabsLeft}>
                  {!authStore.isAuthenticated?
                    <Tab icon={"user-lock"} current={true}>Login</Tab>
                    :
                    <React.Fragment>
                      <Tab icon={"home"} current={matchPath(currentLocation, {path:"/", exact:"true"})} path={"/"}>Home</Tab>
                      <Tab icon={"search"} current={matchPath(currentLocation, {path:"/search", exact:"true"})} path={"/search"}>Search</Tab>
                    </React.Fragment>
                  }
                </div>
                <div className={classes.dynamicTabs}>
                  {authStore.isAuthenticated && Array.from(instanceStore.openedInstances.keys()).map(instanceId => {
                    const instance = instanceStore.getInstance(instanceId);
                    const mode = instanceStore.openedInstances.get(instanceId).viewMode;
                    let label;
                    let color = undefined;
                    if(!instance.isFetching && !instance.hasFetchError){
                      label = instance.form.getField("http:%nexus-slash%%nexus-slash%schema.org%nexus-slash%name").getValue();
                      color = graphStore.colorScheme[instanceStore.nodeTypeMapping[instance.data.label]];
                    }
                    if(!label){
                      label = instanceId;
                    }
                    return (
                      <Tab
                        key={instanceId}
                        icon={instance.isFetching?"circle-notch":"circle"}
                        iconSpin={instance.isFetching}
                        iconColor={color}
                        current={matchPath(currentLocation, {path:`/instance/${mode}/${instanceId}`, exact:"true"})}
                        path={`/instance/${mode}/${instanceId}`}
                        onClose={this.handleCloseInstance.bind(this, instanceId)}
                        fullText={label}>
                        {label}
                      </Tab>
                    );
                  })}
                </div>
                <div className={classes.fixedTabsRight}>
                  {authStore.isAuthenticated &&
                    <React.Fragment>
                      <Tab icon={"chart-bar"} current={matchPath(currentLocation, {path:"/kg-stats", exact:"true"})} path={"/kg-stats"}>Stats</Tab>
                      <Tab icon={"question-circle"} current={matchPath(currentLocation, {path:"/help", exact:"true"})} path={"/help"}>Help</Tab>
                    </React.Fragment>
                  }
                </div>
              </React.Fragment>
            }
          </div>
          <div className={classes.body}>
            {instanceStore.hasUnsavedChanges && !matchPath(this.state.currentLocation, {path:"/instance/:mode/:id*", exact:"true"}) &&
              <div className={`${classes.savebar} ${instanceStore.showSaveBar?"show":""}`}>
                <div className={classes.savebarToggle} onClick={this.handleToggleSaveBar}>
                  <FontAwesomeIcon className={classes.savebarToggleIcon} icon={"exclamation-triangle"}/>&nbsp;
                  <FontAwesomeIcon icon={"caret-down"}/>&nbsp;
                  <FontAwesomeIcon icon={"pencil-alt"}/>
                </div>
                <SaveBar/>
              </div>
            }
            {!authStore.isAuthenticated?
              <Route component={Login} />
              :appStore.globalError?
                <Route component={GlobalError} />
                :
                <Switch>
                  <Route path="/instance/view/:id*" render={(props) => (<Instance {...props} mode="view"/>)} />
                  <Route path="/instance/edit/:id*" render={(props) => (<Instance {...props} mode="edit"/>)} />
                  <Route path="/instance/graph/:id*" render={(props) => (<Instance {...props} mode="graph"/>)} />
                  <Route path="/instance/release/:id*" render={(props) => (<Instance {...props} mode="release"/>)} />

                  <Route path="/search" exact={true} component={Search} />
                  <Route path="/help" exact={true} component={Help} />
                  <Route path="/kg-stats" exact={true} component={Statistics} />
                  <Route path="/loginSuccess" exact={true} component={()=>null} />
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

library.add(faUserLock, faQuestionCircle, faHome, faSearch, faCamera, faCaretRight, faUndo, faSave, faSyncAlt,
  faCaretDown, faCircleNotch, faCircle, faTimes, faEdit, faProjectDiagram,
  faCloudUploadAlt, faChartBar, faCodeBranch, faPencilAlt, faEye, faEyeSlash, faExclamationTriangle,
  faUnlink, faBan, faRedoAlt, faMoneyCheck, faThumbsUp, faCheck, faFile, faPlus, faDotCircle, faArrowRight,
  faExpandArrowsAlt, faCompress, faExclamationCircle, faEnvelope, faSun, faMoon);

render(<App/>, document.getElementById("root"));
