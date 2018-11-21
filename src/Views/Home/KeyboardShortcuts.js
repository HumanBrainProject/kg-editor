import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

const styles = {
  container: {
    padding: "15px",
    "& h3": {
      marginTop: 0
    },
    "& ul": {
      listStyleType: "none",
      paddingLeft: 0,
      "& li": {
        "& + li": {
          marginTop: "15px"
        },
        "& .kbd": {
          display: "inline-block",
          margin: "0 0.1em",
          padding: "0.1em 0.6em",
          border: "1px solid #ccc",
          borderRadius: "3px",
          backgroundColor: "#f7f7f7",
          fontFamily: "Arial,Helvetica,sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          color: "#333",
          boxShadow: "0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset",
          textShadow: "0 1px 0 #fff",
          whiteSpace: "nowrap"
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class KeyboardShortcuts extends React.Component {
  render(){
    const { classes } = this.props;
    return (
      <div className={`${classes.container} widget`}>
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><span className="kbd">Ctrl</span> + click to open an instance in a new background tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">b</span> browse the instances.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">n</span> create a new instance.</li>
          <li><span className="kbd">Ctrl</span> + <span className="kbd">w</span> to close current tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">&#8592;</span> to active previous tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">&#8594;</span> to active next tab.</li>
          <li><span className="kbd">Ctrl</span> + <span className="kbd">Alt</span> + <span className="kbd">t</span> to toggle theme.</li>
        </ul>
      </div>
    );
  }
}