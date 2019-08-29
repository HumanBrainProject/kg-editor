import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";
import { Form, Field } from "hbp-quickfire";
import structureStore from "../../../Stores/StructureStore";


const styles = {
  container: {
    position: "relative",
    width: "calc(100% - 2px)",
    height: "100%",
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
    },
    "& .quickfire-empty-field": {
      display: "none"
    },
    "& .quickfire-readmode-item:not(:last-child):after":{
      content: "';\\00a0 !important'"
    },
    "& > div:first-child > div:first-child": {
      overflowY: "auto !important"
    }
  },
  panel: {
    padding: "15px",
    border: "1px solid var(--bg-color-blend-contrast1)",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)"
  },
  header: {
    padding: "0 0 10px 0",
    "& h6": {
      margin: "0 !important",
      color: "var(--ft-color-normal)",
      fontWeight: "bold"
    }
  },
  field:{
    marginBottom:"10px",
    wordBreak:"break-word"
  },
  id:{
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  }
};

@injectStyles(styles)
@observer
export default class InstanceInvite extends React.Component{
  render(){
    const { classes, instance } = this.props;

    if (instance.isFetching || instance.hasFetchError) {
      return null;
    }

    const promotedFields = instance.promotedFields;
    const nonPromotedFields = instance.nonPromotedFields;

    const nodeType = instance.data && instance.data.label;

    const color = structureStore.colorPalletteByType(instance.path);

    const nexusId = instance.data.fields.id?instance.data.fields.id.nexus_id:"<new>";

    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
          <Form store={instance.form}>
            <div className={classes.panel}>
              <div className={classes.header}>
                <Row>
                  <Col xs={12}>
                    <h6>
                      <FontAwesomeIcon icon={"circle"} color={color?color:undefined}/>&nbsp;&nbsp;<span>{nodeType}</span>
                    </h6>
                  </Col>
                </Row>
              </div>
              <div>
                {promotedFields.map(fieldKey => (
                  <div key={this.props.id+fieldKey} className={classes.field}>
                    <Field name={fieldKey}/>
                  </div>
                ))}
              </div>
              <div>
                {nonPromotedFields.map(fieldKey => (
                  <div key={this.props.id+fieldKey} className={classes.field}>
                    <Field name={fieldKey} />
                  </div>
                ))}
              </div>
              <div>
                <Row>
                  <Col xs={12}>
                    <div className={classes.id}>Nexus ID: {nexusId}</div>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </Scrollbars>
      </div>
    );
  }
}