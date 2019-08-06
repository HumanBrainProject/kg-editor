import React from "react";
import instanceStore from "../Stores/InstanceStore";


export default class FieldError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(){
    const instance = instanceStore.instances.get(this.props.id);
    instance && instance.setFieldError(this.props.field);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}