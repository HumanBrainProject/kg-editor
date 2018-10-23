import React from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import favoriteStore from "../../Stores/FavoriteStore";
import favoriteStatusStore from "../../Stores/FavoriteStatusStore";
import FavoriteButton from "../../Components/FavoriteButton";
import { SingleField } from "hbp-quickfire";
import { Button, ButtonGroup } from "react-bootstrap";

let styles = {
  container:{
    display:"inline-block",
    fontSize:"0.75em"
  },
  loader: {
    borderRadius:"0.14em",
    width:"2.5em",
    background:"var(--bg-color-ui-contrast2)",
    textAlign:"center",
    color:"var(--ft-color-loud)",
    border:"1px solid var(--ft-color-loud)",
    "& .svg-inline--fa":{
      fontSize:"0.8em",
      verticalAlign:"baseline"
    }
  },
  favoritesContainer: {
    position: "relative"
  },
  favoritesPanel: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "15px 15px 0 15px",
    borderRadius: "3px",
    zIndex: 100
  },
  favoritesCloseButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "transparent",
    border: "transparent"
  },
  favoritesArrow: {
    position: "absolute",
    top: "-7px",
    left: "1px",
    width: 0,
    height: 0,
    border: "0 solid transparent",
    borderRightWidth: "6px",
    borderLeftWidth: "6px",
    borderBottom: "6px solid var(--list-border-hover)" //--bg-color-ui-contrast1
  },
  fetchErrorContainer: {
    position: "relative"
  },
  fetchErrorButton: {
    backgroundColor: "transparent",
    color: "var(--favorite-off-color)",  // #e67e22 #e74c3c
    border: "transparent",
    outline: 0
  },
  fetchErrorPanel: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "15px 15px 0 15px",
    borderRadius: "3px",
    zIndex: 100
  },
  fetchErrorMessage: {
    margin: "15px 0",
    color: "#e74c3c",
    wordBreak: "keep-all"
  },
  fetchErrorCloseButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "transparent",
    border: "transparent"
  },
  fetchErrorButtons: {
    width: "100%",
    margin: "10px 0 15px 0",
    textAlign: "center",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  fetchErrorArrow: {
    position: "absolute",
    top: "-7px",
    left: "1px",
    width: 0,
    height: 0,
    border: "0 solid transparent",
    borderRightWidth: "6px",
    borderLeftWidth: "6px",
    borderBottom: "6px solid var(--list-border-hover)" //--bg-color-ui-contrast1
  },
  saveErrorContainer: {
    position: "relative"
  },
  saveErrorButton: {
    backgroundColor: "transparent",
    color: "#e74c3c",
    border: "transparent",
    outline: 0
  },
  saveErrorPanel: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "15px 15px 0 15px",
    borderRadius: "3px",
    zIndex: 100
  },
  saveErrorMessage: {
    margin: "15px 0",
    color: "#e74c3c",
    wordBreak: "keep-all"
  },
  saveErrorCloseButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "transparent",
    border: "transparent"
  },
  saveErrorButtons: {
    width: "100%",
    margin: "10px 0 15px 0",
    textAlign: "center",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  saveErrorArrow: {
    position: "absolute",
    top: "-7px",
    left: "1px",
    width: 0,
    height: 0,
    border: "0 solid transparent",
    borderRightWidth: "6px",
    borderLeftWidth: "6px",
    borderBottom: "6px solid var(--list-border-hover)" //--bg-color-ui-contrast1
  }
};

@injectStyles(styles)
@observer
export default class FavoriteStatus extends React.Component{
  constructor(props){
    super(props);
    this.state = { showFavorites: false, showError: false };
    favoriteStore.fetchLists();
    favoriteStatusStore.fetchStatus(this.props.id);
    this.favoritesTimer = null;
    this.handleFavoriteIconClick = this.handleFavoriteIconClick.bind(this);
    this.handleFavoriteClose = this.handleFavoriteClose.bind(this);
    this.handleFavoritesOver = this.handleFavoritesOver.bind(this);
    this.handleFavoritesLeave = this.handleFavoritesLeave.bind(this);
    this.handleFavoriteChange = this.handleFavoriteChange.bind(this);
    this.handleAddFavorite = this.handleAddFavorite.bind(this);
    this.fetchErrorTimer = null;
    this.handleFetchErrorClick = this.handleFetchErrorClick.bind(this);
    this.handleFetchErrorClose = this.handleFetchErrorClose.bind(this);
    this.handleFetchErrorOver = this.handleFetchErrorOver.bind(this);
    this.handleFetchErrorLeave = this.handleFetchErrorLeave.bind(this);
    this.handleFetchRetry = this.handleFetchRetry.bind(this);
    this.saveErrorTimer = null;
    this.handleSaveErrorClick = this.handleSaveErrorClick.bind(this);
    this.handleSaveErrorClose = this.handleSaveErrorClose.bind(this);
    this.handleSaveErrorOver = this.handleSaveErrorOver.bind(this);
    this.handleSaveErrorLeave = this.handleSaveErrorLeave.bind(this);
    this.handleSaveCancel = this.handleSaveCancel.bind(this);
    this.handleSaveRetry = this.handleSaveRetry.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    favoriteStatusStore.fetchStatus(newProps.id);
  }

  handleFavoriteIconClick(event) {
    event && event.stopPropagation();
    this.setState(state => ({showFavorites: !state.showFavorites }));
  }

  handleFavoritesOver() {
    if (this.state.showFavorites) {
      clearTimeout(this.favoritesTimer);
    }
  }

  handleFavoritesLeave() {
    if (this.state.showFavorites) {
      clearTimeout(this.favoritesTimer);
      this.favoritesTimer = setTimeout(() => this.handleFavoriteClose(), 500);
    }
  }

  handleFavoriteClose(event) {
    event && event.stopPropagation();
    this.setState({showFavorites: false});
    favoriteStatusStore.saveStatus(this.props.id);
  }

  handleFavoriteChange(event, field) {
    const favorites = field.value.map(favorite => favorite.value);
    favoriteStatusStore.updateStatus(this.props.id, favorites);
  }

  async handleAddFavorite(name) { // , field, store) {
    await favoriteStore.createNewFavorite(name);
    /*
    const newFavoriteId = await favoriteStore.createNewFavorite(name);
    if(newFavoriteId){
      const favorites = field.value.map(favorite => favorite.value);
      favorites.push(newFavoriteId);
      favoriteStatusStore.updateStatus(this.props.id, favorites);
    }
    */
  }

  handleFetchErrorClick(event) {
    event.stopPropagation();
    this.setState(state => ({showError: !state.showError }));
  }

  handleFetchErrorOver() {
    if (this.state.showError) {
      clearTimeout(this.fetchErrorTimer);
    }
  }

  handleFetchErrorLeave() {
    if (this.state.showError) {
      clearTimeout(this.fetchErrorTimer);
      this.fetchErrorTimer = setTimeout(() => this.handleFetchErrorClose(), 500);
    }
  }

  handleFetchErrorClose(event) {
    event && event.stopPropagation();
    this.setState({showError: false});
  }

  handleFetchRetry(event) {
    event && event.stopPropagation();
    this.setState({showError: false});
    favoriteStatusStore.retryFetchStatus();
  }

  handleSaveErrorClick(event) {
    event.stopPropagation();
    this.setState(state => ({showError: !state.showError }));
  }

  handleSaveErrorOver() {
    if (this.state.showError) {
      clearTimeout(this.fetchErrorTimer);
    }
  }

  handleSaveErrorLeave() {
    if (this.state.showError) {
      clearTimeout(this.fetchErrorTimer);
      this.fetchErrorTimer = setTimeout(() => this.handleSaveErrorClose(), 500);
    }
  }

  handleSaveErrorClose(event) {
    event && event.stopPropagation();
    this.setState({showError: false});
  }

  handleSaveCancel(event) {
    event && event.stopPropagation();
    this.setState({showError: false});
    favoriteStatusStore.revertSaveStatus(this.props.id);
  }

  handleSaveRetry(event) {
    event && event.stopPropagation();
    this.setState({showError: false});
    favoriteStatusStore.saveStatus(this.props.id);
  }

  render(){
    const instanceStatus = favoriteStatusStore.getInstance(this.props.id);
    const { classes, className } = this.props;
    const values = (instanceStatus && instanceStatus.data && !!instanceStatus.data.favorites.length)?toJS(instanceStatus.data.favorites):[];
    const isFavorite = values.length;
    const favorites = toJS(favoriteStore.favorites);
    return(
      <div className={`${classes.container} ${className?className:""}`}>
        {instanceStatus.isFetching || (!instanceStatus.isFetched && !instanceStatus.hasFetchError)?
          <div className={classes.loader} title="retrieving favrorite status">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
          :
          instanceStatus.hasFetchError?
            <div className={classes.fetchErrorContainer} onMouseLeave={this.handleFetchErrorLeave} onMouseOver={this.handleFetchErrorOver}>
              <button className={classes.fetchErrorButton} onClick={this.handleFetchErrorClick} title="favrorite status unknown, click for more information">
                <FontAwesomeIcon icon="question-circle"/>
              </button>
              {this.state.showError && (
                <div className={classes.fetchErrorPanel} onMouseLeave={this.handleFetchErrorLeave} onMouseOver={this.handleFetchErrorOver} onClick={event => event.stopPropagation()}>
                  <h5 className={classes.fetchErrorMessage}>{instanceStatus.fetchError}</h5>
                  <div className={classes.fetchErrorButtons}>
                    <Button bsStyle="primary" bsSize="small" onClick={this.handleFetchRetry}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
                  </div>
                  <button className={classes.fetchErrorCloseButton} onClick={this.handleFetchErrorClose}><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
                  <div className={classes.fetchErrorArrow} />
                </div>
              )}
            </div>
            :
            instanceStatus.hasSaveError?
              <div className={classes.saveErrorContainer} onMouseLeave={this.handleSaveErrorLeave} onMouseOver={this.handleSaveErrorOver}>
                <button className={classes.saveErrorButton} onClick={this.handleSaveErrorClick} title="failed to save favorite, click for more information">
                  <FontAwesomeIcon icon="exclamation-triangle"/>
                </button>
                {this.state.showError && (
                  <div className={classes.saveErrorPanel} onMouseLeave={this.handleSaveErrorLeave} onMouseOver={this.handleSaveErrorOver} onClick={event => event.stopPropagation()}>
                    <h5 className={classes.saveErrorMessage}>{instanceStatus.saveError}</h5>
                    <div className={classes.saveErrorButtons}>
                      <Button bsStyle="primary" bsSize="small" onClick={this.handleSaveCancel}><FontAwesomeIcon icon="undo"/>&nbsp;Revert</Button>
                      <Button bsStyle="primary" bsSize="small" onClick={this.handleSaveRetry}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
                    </div>
                    <button className={classes.saveErrorCloseButton} onClick={this.handleSaveErrorClose}><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
                    <div className={classes.saveErrorArrow} />
                  </div>
                )}
              </div>
              :
              <div className={classes.favoritesContainer} onMouseLeave={this.handleFavoritesLeave} onMouseOver={this.handleFavoritesOver}>
                <FavoriteButton isFavorite={isFavorite} onClick={this.handleFavoriteIconClick} />
                {this.state.showFavorites && (
                  <div className={classes.favoritesPanel} onMouseLeave={this.handleFavoritesLeave} onMouseOver={this.handleFavoritesOver} onClick={event => event.stopPropagation()}>
                    <SingleField type="DropdownSelect" label="Favorites:" value={values} options={favorites} allowCustomValues={true} onChange={this.handleFavoriteChange} onAddCustomValue={this.handleAddFavorite} />
                    <button className={classes.favoritesCloseButton} onClick={this.handleFavoriteClose}><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
                    <div className={classes.favoritesArrow} />
                  </div>
                )}
              </div>
        }
      </div>
    );
  }
}