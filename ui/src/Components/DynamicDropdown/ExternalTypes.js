import React from "react";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  container: {
    margin: "6px",
    backgroundColor: "rgba(255, 226, 20, 0.6)",
    borderRadius: "5px",
    padding: "3px 12px"
  }
});

const ExternalTypes = ({types}) => (
  <React.Fragment>
    {types.map(type => <ExternalType key={type.name} type={type} />)}
  </React.Fragment>
);

const ExternalType = ({ type }) => {

  const classes = useStyles();
  const types = type.space.join(", or ");
  const style = type.color ? { color: type.color } : {};

  return(
    <div className={classes.container}>
      <em>New instance of type <span style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      {type.label} could only be created in space <strong>{types}</strong></em>
    </div>
  );
};

export default ExternalTypes;