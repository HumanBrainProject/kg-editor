import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Form, Field } from "hbp-quickfire";

import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    color: "var(--ft-color-loud)"
  },
  panel: {
    position: "relative",
    width: "60%",
    height: "calc(100% - 40px)",
    margin:"20px 20%"
  },
  content: {
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--bg-color-blend-contrast1)",
    marginBottom: "15px",
    padding: "15px",
    "& h4": {
      marginBottom: "15px"
    },
    "& p": {
      marginBottom: "15px"
    },
    "& ul": {
      marginBottom: "15px"
    },
    "& strong": {
      color: "var(--ft-color-louder)"
    }
  },
  id:{
    fontSize:"0.75em",
    color:"var(--ft-color-normal)",
    marginTop:"20px",
    marginBottom:"20px"
  },
  field:{
    marginBottom:"10px",
    wordBreak:"break-word"
  }
};

@injectStyles(styles)
@observer
export default class InstanceMange extends React.Component{
  constructor(props) {
    super(props);
    this.fetchInstance();
  }

  fetchInstance(forceFetch = false){
    instanceStore.getInstance(this.props.id, forceFetch);
  }

  UNSAFE_componentWillReceiveProps(){
    instanceStore.setReadMode(true);
  }

  handleDuplicateInstance = async () => {
    let newInstanceId = await instanceStore.duplicateInstance(this.props.id);
    routerStore.history.push("/instance/edit/"+newInstanceId);
  }

  handleDeleteInstance = async () => {

  }

  render(){
    const { classes } = this.props;

    const instance = instanceStore.getInstance(this.props.id);
    const promotedFields = instanceStore.getPromotedFields(instance);

    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          <div className={classes.panel}>
            {instance.isFetching?
              <FetchingLoader>
                <span>Fetching instance information...</span>
              </FetchingLoader>
              :!instance.hasFetchError?
                <React.Fragment>
                  <div className={classes.content}>
                    <h4>{instance.data.label}</h4>
                    <div className={classes.id}>
                      Nexus ID: {this.props.id}
                    </div>
                    <Form store={instance.form} key={this.props.id}>
                      {promotedFields.map(fieldKey => {
                        return(
                          <div key={this.props.id+fieldKey} className={classes.field}>
                            <Field name={fieldKey}/>
                          </div>
                        );
                      })}
                    </Form>
                  </div>
                  <div className={classes.content}>
                    <h4>Duplicate this instance</h4>
                    <ul>
                      <li>Be careful. After duplication both instances will look the same.</li>
                      <li>After dupplication you should update the name &amp; description fields.</li>
                    </ul>
                    <Button bsStyle={"warning"} onClick={this.handleDuplicateInstance}>
                      <FontAwesomeIcon icon={"copy"}/> &nbsp; Duplicate this instance
                    </Button>
                  </div>
                  <div className={classes.content}>
                    <h4>Delete this instance</h4>
                    <p>
                      <strong>Removed instances cannot be restored!</strong>
                    </p>
                    <Button bsStyle={"danger"} onClick={this.handleDeleteInstance}>
                      <FontAwesomeIcon icon={"trash-alt"}/> &nbsp; Delete this instance
                    </Button>
                  </div>
                </React.Fragment>
                :
                <BGMessage icon={"ban"}>
                  There was a network problem fetching the instance.<br/>
                  If the problem persists, please contact the support.<br/>
                  <small>{instance.fetchError}</small><br/><br/>
                  <Button bsStyle={"primary"} onClick={this.fetchInstance.bind(this, true)}>
                    <FontAwesomeIcon icon={"redo-alt"}/> &nbsp; Retry
                  </Button>
                </BGMessage>
            }
          </div>
        </Scrollbars>
      </div>
    );
  }
}