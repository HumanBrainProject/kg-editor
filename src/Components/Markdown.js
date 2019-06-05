import React from "react";
import showdown from "showdown";
import xssFilter from "showdown-xss-filter";

const converter = new showdown.Converter({extensions: [xssFilter]});

const RenderMarkdownField = props => {
  let markdownEval = converter.makeHtml(props.value);
  return(
    <span dangerouslySetInnerHTML={{__html:markdownEval}} />
  );
};

export default RenderMarkdownField;