import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopOverButton from "./PopOverButton";
import { SingleField } from "hbp-quickfire";

const styles = {
  button: {
    textAlign:"center",
    lineHeight:"normal",
    opacity:1,
    "& .icon": {
      color: "transparent",
      stroke: "var(--favorite-off-color)",
      strokeWidth: "4em",
      fontSize:"1em",
      verticalAlign:"baseline"
    },
    "& .icon.is-favorite": {
      color: "var(--favorite-on-color)",
      strokeWidth: 0
    },
    "&:hover .icon, &:active .icon": {
      color: "var(--favorite-off-color-highlight)",
      strokeWidth: 0
    },
    "&:hover .icon.is-favorite, &:active .icon.is-favorite": {
      color: "var(--favorite-on-color-highlight)",
      strokeWidth: 0
    }
  }
};

@injectStyles(styles)
export default class FavoriteButton extends React.Component {
  constructor (props) {
    super(props);
    this.state = { listPosition: "bottom" };
  }

  changeFavoritesListPosition(position) {
    this.setState({listPosition: position?position:"bottom" });
  }

  handleValueChange(event, field) {
    const favorites = field.value.map(favorite => favorite.id);
    typeof this.props.onChange === "function" && this.props.onChange(favorites);
  }

  handleNew(name) { // , field, store) {
    typeof this.props.onNew === "function" && this.props.onNew(name);
  }

  render() {
    const {classes, className, values, list, onSave} = this.props;
    const isFavorite = values && values.length;
    return (
      <PopOverButton
        className={className}
        buttonClassName={classes.button}
        iconComponent={FontAwesomeIcon}
        iconProps={{icon: "star", className: `icon ${isFavorite?"is-favorite":""}`}}
        onClose={onSave}
        onPositionChange={this.changeFavoritesListPosition.bind(this)}
      >
        <SingleField type="DropdownSelect" label="Favorites:" value={values} options={list} mappingValue="id" mappingLabel="name" listPosition={this.state.listPosition?this.state.listPosition:"bottom"} allowCustomValues={true} onChange={this.handleValueChange.bind(this)} onAddCustomValue={this.handleNew} />
      </PopOverButton>
    );
  }
}