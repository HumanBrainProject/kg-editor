/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

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
      stroke: "var(--bookmark-off-color)",
      strokeWidth: "4em",
      fontSize:"1em",
      verticalAlign:"baseline"
    },
    "& .icon.is-bookmark": {
      color: "var(--bookmark-on-color)",
      strokeWidth: 0
    },
    "&:hover .icon, &:active .icon": {
      color: "var(--bookmark-off-color-highlight)",
      strokeWidth: 0
    },
    "&:hover .icon.is-bookmark, &:active .icon.is-bookmark": {
      color: "var(--bookmark-on-color-highlight)",
      strokeWidth: 0
    }
  }
};

@injectStyles(styles)
export default class BookmarkButton extends React.Component {
  constructor (props) {
    super(props);
    this.state = { listPosition: "bottom" };
  }

  changeBookmarkListPosition(position) {
    this.setState({listPosition: position?position:"bottom" });
  }

  handleValueChange(event, field) {
    const bookmarkLists = field.value.map(bookmarkList => bookmarkList.id);
    typeof this.props.onChange === "function" && this.props.onChange(bookmarkLists);
  }

  handleNew(name) { // , field, store) {
    typeof this.props.onNew === "function" && this.props.onNew(name);
  }

  render() {
    const {classes, className, values, list, onSave} = this.props;
    const isBookmark = values && values.length;
    return (
      <PopOverButton
        className={className}
        buttonClassName={classes.button}
        iconComponent={FontAwesomeIcon}
        iconProps={{icon: "star", className: `icon ${isBookmark?"is-bookmark":""}`}}
        onClose={onSave}
        onPositionChange={this.changeBookmarkListPosition.bind(this)}
      >
        <SingleField key={JSON.stringify(values)} type="DropdownSelect" label="Bookmarks:" value={values} options={list} mappingValue="id" mappingLabel="name" listPosition={this.state.listPosition?this.state.listPosition:"bottom"} allowCustomValues={true} onChange={this.handleValueChange.bind(this)} onAddCustomValue={this.handleNew.bind(this)} />
      </PopOverButton>
    );
  }
}