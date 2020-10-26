/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopOverButton from "./PopOverButton";
import { SingleField } from "hbp-quickfire";

const useStyles = createUseStyles({
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
});

const BookmarkButton = ({ className, values, list, onSave, onChange, onNew }) => {

  const classes = useStyles();

  const [listPosition, setListPosition] = useState("bottom");

  const changeBookmarkListPosition = position => {
    setListPosition(position?position:"bottom");
  };

  const handleValueChange = (event, field) => {
    const bookmarkLists = field.value.map(bookmarkList => bookmarkList.id);
    typeof onChange === "function" && onChange(bookmarkLists);
  };

  const handleNew = name => {
    typeof onNew === "function" && onNew(name);
  };

  const isBookmark = values && values.length;
  return (
    <PopOverButton
      className={className}
      buttonClassName={classes.button}
      iconComponent={FontAwesomeIcon}
      iconProps={{icon: "star", className: `icon ${isBookmark?"is-bookmark":""}`}}
      onClose={onSave}
      onPositionChange={changeBookmarkListPosition}
    >
      <SingleField key={JSON.stringify(values)} type="DropdownSelect" label="Bookmarks:" value={values} options={list} mappingValue="id" mappingLabel="label" listPosition={listPosition?listPosition:"bottom"} allowCustomValues={true} onChange={handleValueChange} onAddCustomValue={handleNew} />
    </PopOverButton>
  );
};

export default BookmarkButton;