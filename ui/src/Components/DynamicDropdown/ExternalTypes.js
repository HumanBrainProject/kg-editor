import React from "react";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

const useStyles = createUseStyles({
  container: {
    marginLeft: "5px",
    borderRadius: "5px",
    paddingRight: "12px",
    paddingLeft: "12px"
  },
  info: {
    backgroundColor: "rgba(255, 226, 20, 0.6)",
    padding: "5px",
    marginTop: "2px",
    cursor: "pointer"
  },
  create: {
    paddingBottom: "5px"
  }
});

const ExternalTypes = ({types, onExternalCreate}) => (
  <>
    {types.map(type => <ExternalType key={type.name} type={type} onExternalCreate={onExternalCreate}/>)}
  </>
);

const ExternalType = ({ type, onExternalCreate }) => {

  const classes = useStyles();

  return (
    <div className={classes.container}>
      {type.spaces.map(space => (
        <Space key={space.id} space={space} type={type} onExternalCreate={onExternalCreate} />
      ))}
    </div>
  );
};

const Space = ({space, type, onExternalCreate}) => {

  const classes = useStyles();

  const style = type.color ? { color: type.color } : {};

  const handleOnCreate = () => onExternalCreate(space.name, type.name);

  if (space.permissions.canCreate) {
    return (
      <div className={classes.create}>
        <Button variant="primary" size="sm" onClick={handleOnCreate}>
          <em>Create an instance of type <span style={style}>
            <FontAwesomeIcon fixedWidth icon="circle" />
          </span>
          {type.label} in space <strong>{space.name}</strong></em>
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.info}>
      <em>You are not allowed to create an instance of type <span style={style}>
        <FontAwesomeIcon fixedWidth icon="circle" />
      </span>
      {type.label} in space <strong>{space.name}</strong>. Please contact the support.</em>
    </div>
  );
};

export default ExternalTypes;