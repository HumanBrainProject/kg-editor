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

class ExternalType extends React.Component {
  render() {
    const classes = useStyles();
    const  {type} = this.props;
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

export default ExternalTypes;