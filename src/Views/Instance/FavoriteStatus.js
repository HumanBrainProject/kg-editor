import React from "react";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import searchStore from "../../Stores/SearchStore";
import favoriteStatusStore from "../../Stores/FavoriteStatusStore";
import FavoriteButton from "../../Components/FavoriteButton";
import PopOverButton from "../../Components/PopOverButton";

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
  fetchErrorButton: {
    color: "var(--favorite-off-color)",  // #e67e22 #e74c3c
  },
  saveErrorButton: {
    color: "#e74c3c"
  }
};

@injectStyles(styles)
@observer
export default class FavoriteStatus extends React.Component{
  constructor(props){
    super(props);
    favoriteStatusStore.fetchStatus(this.props.id);
    this.handleFavoritesSave = this.handleFavoritesSave.bind(this);
    this.handleFavoritesChange = this.handleFavoritesChange.bind(this);
    this.handleNewFavorite = this.handleNewFavorite.bind(this);
    this.handleFetchRetry = this.handleFetchRetry.bind(this);
    this.handleSaveCancel = this.handleSaveCancel.bind(this);
    this.handleSaveRetry = this.handleSaveRetry.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    favoriteStatusStore.fetchStatus(newProps.id);
  }

  handleFavoritesSave() {
    favoriteStatusStore.saveStatus(this.props.id);
  }

  handleFavoritesChange(favorites) {
    favoriteStatusStore.updateStatus(this.props.id, favorites);
  }

  async handleNewFavorite(name) { // , field, store) {
    await searchStore.createNewBookmark(name);
    /*
    const newFavoriteId = await searchStore.createNewBookmark(name);
    if(newFavoriteId){
      const favorites = field.value.map(favorite => favorite.value);
      favorites.push(newFavoriteId);
      favoriteStatusStore.updateStatus(this.props.id, favorites);
    }
    */
  }

  handleFetchRetry() {
    favoriteStatusStore.retryFetchStatus();
  }

  handleSaveCancel() {
    favoriteStatusStore.revertSaveStatus(this.props.id);
  }

  handleSaveRetry() {
    favoriteStatusStore.saveStatus(this.props.id);
  }

  render(){
    const instanceStatus = favoriteStatusStore.getInstance(this.props.id);
    const { classes, className } = this.props;
    const values = (instanceStatus && instanceStatus.data && !!instanceStatus.data.favorites.length)?toJS(instanceStatus.data.favorites):[];
    const favorites = toJS(searchStore.bookmarksList);
    return(
      <div className={`${classes.container} ${className?className:""}`}>
        {instanceStatus.isFetching || (!instanceStatus.isFetched && !instanceStatus.hasFetchError)?
          <div className={classes.loader} title="retrieving favrorite status">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
          :
          instanceStatus.hasFetchError?
            <PopOverButton
              buttonClassName={classes.fetchErrorButton}
              buttonTitle="favrorite status unknown, click for more information"
              iconComponent={FontAwesomeIcon}
              iconProps={{icon: "question-circle"}}
              text={instanceStatus.fetchError}
              okComponent={() => (
                <React.Fragment>
                  <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
                </React.Fragment>
              )}
              onOkClick={this.handleFetchRetry}
            />
            :
            instanceStatus.hasSaveError?
              <PopOverButton
                buttonClassName={classes.saveErrorButton}
                buttonTitle="failed to save favorite, click for more information"
                iconComponent={FontAwesomeIcon}
                iconProps={{icon: "exclamation-triangle"}}
                text={instanceStatus.saveError}
                okComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
                  </React.Fragment>
                )}
                onOkClick={this.handleSaveRetry}
                cancelComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="undo-alt"/>&nbsp;Revert
                  </React.Fragment>
                )}
                onCancelClick={this.handleSaveCancel}
              />
              :
              <FavoriteButton values={values} list={favorites} onSave={this.handleFavoritesSave} onChange={this.handleFavoritesChange} onNew={this.handleNewFavorite} />
        }
      </div>
    );
  }
}