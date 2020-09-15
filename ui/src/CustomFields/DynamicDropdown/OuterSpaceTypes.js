import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  container: {
    margin: "6px",
    backgroundColor: "rgba(255, 226, 20, 0.6)",
    borderRadius: "5px",
    padding: "3px 12px"
  }
};


const OuterSpaceTypes = ({types}) => (
  <React.Fragment>
    {types.map(type => <OuterSpaceType key={type.name} type={type} />)}
  </React.Fragment>
);

@injectStyles(styles)
class  OuterSpaceType extends React.Component {
  render() {
    const  {type, classes} = this.props;
    return(
      <div className={classes.container}>
        <em>New instance of type <span style={type.color ? { color: type.color } : {}}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {type.label} could only be created in workspace <strong>{type.space.join(", or ")}</strong></em>
      </div>
    );

  }

}

export default OuterSpaceTypes;