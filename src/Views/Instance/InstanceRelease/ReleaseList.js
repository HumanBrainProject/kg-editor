import React from "react";
import injectStyles from "react-jss";
import { List } from "react-virtualized";
import { observer } from "mobx-react";
import releaseStore from "../../../Stores/ReleaseStore";
import ReleaseNode from "./ReleaseNode";

const styles = {
  container: {
    position: "relative",
    width:"100%",
    height:"100%",
    maxHeight: "100%"
  }
};

@injectStyles(styles)
@observer
export default class ReleaseList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      width: 0,
      height: 0
    };
  }

  componentDidMount() {
    this.setDimensions();
    window.addEventListener("resize", this.setDimensions);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.wrapperRef && ((prevState.width !== this.wrapperRef.offsetWidth) || (prevState.height !== this.wrapperRef.offsetHeight))) {
      this.setDimensions();
    }
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.setDimensions);
    this.wrapperRef && this.wrapperRef.parentNode.parentNode.removeEventListener("resize", this.setDimensions);
  }

  setDimensions = () => {
    if(this.wrapperRef){
      this.setState({width: this.wrapperRef.offsetWidth, height: this.wrapperRef.offsetHeight});
    }
  }

  rowRenderer = ({key, index,style }) => {
    const rowData =  releaseStore.instanceList[index];
    return (
      <div
        key={key}
        style={style}
      >
        <ReleaseNode node={rowData.node} level={rowData.level} />
      </div>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div ref={ref=>this.wrapperRef = ref} className={classes.container}>
        <List
          width={this.state.width}
          height={this.state.height}
          rowHeight={42}
          rowCount={releaseStore.instanceList.length}
          rowRenderer={this.rowRenderer}
        />
      </div>
    );
  }
}