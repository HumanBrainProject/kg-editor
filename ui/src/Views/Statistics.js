import React from "react";

class Statistics extends React.Component{
  render(){
    return (
      <iframe src="/statistics/" style={{width:"100%", height:"calc(100% + 80px)", marginTop:"-80px"}} frameBorder={0}/>
    );
  }
}

export default Statistics;