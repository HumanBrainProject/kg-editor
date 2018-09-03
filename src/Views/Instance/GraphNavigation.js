import React from "react";
import injectStyles from "react-jss";
import { Breadcrumb } from "react-bootstrap";

const styles = {
  navigationContainer: {
    left: "0px",
    height: "20%",
    top: "10px",
    position: "absolute"
  }
};

@injectStyles(styles)
export default class GraphNavigation extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(item) {
    const index = this.props.breadCrumbs.indexOf(item);
    this.props.handleNavigationClick(index);
  }

  render() {
    const { classes } = this.props;
    const breadCrumbs = this.props.breadCrumbs.map((node, index) => {
      return <Breadcrumb.Item key={node.id + "" + index} onClick={() => this.handleClick(node)}>
        {node.title}
      </Breadcrumb.Item>;
    });
    return (
      <div className={classes.navigationContainer}>
        <Breadcrumb>
          {breadCrumbs}
        </Breadcrumb>
      </div>
    );
  }

}