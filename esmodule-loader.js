// esmodule-loader.js
import React, { Component } from 'react';
import { Loading } from '@alifd/next';

const PromiseState = {
  loading: 'loading',
  success: 'success',
  failed: 'failed',
};


export class ESMModuleLoader extends Component {
  state = {
    scriptState: PromiseState.loading,
    module: null,
  };

  componentDidMount() {
    this.loadModule();
  }

  loadModule = async () => {
    const { moduleUrl } = this.props;

    try {
      const module = await import(moduleUrl);
      this.setState({ scriptState: PromiseState.success, module });
    } catch (error) {
      console.error('Error loading module:', error);
      this.setState({ scriptState: PromiseState.failed });
    }
  };

  render() {
    const { scriptState, module } = this.state;
    const { loadingComponent } = this.props;

    if (scriptState === PromiseState.loading) {
      return loadingComponent || <Loading />;
    }

    if (scriptState === PromiseState.failed) {
      return <div>Error loading module.</div>;
    }

    return this.props.children(module); // Render children with the loaded module
  }
}

export default ESMModuleLoader;