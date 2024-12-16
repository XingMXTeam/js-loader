// umd-loader.js
import React, { Component } from 'react';
import { loadStyle } from './load-style';
import { loadScript } from './load-script';
import { Loading } from '@alifd/next';

const PromiseState = {
  loading: 'loading',
  success: 'success',
  failed: 'failed',
};

export class UMDLoader extends Component {
  state = {
    scriptState: PromiseState.loading,
  };

  componentDidMount() {
    this.loadResources();
  }

  get resourceUrls() {
    const { jsCdnAddress = [], cssCdnAddress = [] } = this.props;
    const jsUrls = typeof jsCdnAddress === 'string' ? [jsCdnAddress] : jsCdnAddress;
    const cssUrls = typeof cssCdnAddress === 'string' ? [cssCdnAddress] : cssCdnAddress;
    return [
      ...jsUrls.map(url => ({ type: 'JAVASCRIPT', url })),
      ...cssUrls.map(url => ({ type: 'CSS', url })),
    ];
  }

  loadResources = () => {
    const resourceUrls = this.resourceUrls;

    if (!resourceUrls.length) {
      this.setState({ scriptState: PromiseState.failed });
      return;
    }

    const promises = resourceUrls.map(({ url, type }) => {
      return type === 'CSS' ? loadStyle(url) : loadScript(url);
    });

    Promise.all(promises)
      .then(() => {
        this.setState({ scriptState: PromiseState.success });
      })
      .catch(() => {
        this.setState({ scriptState: PromiseState.failed });
      });
  };

  render() {
    const { scriptState } = this.state;
    const { loadingComponent } = this.props;

    if (scriptState === PromiseState.loading) {
      return loadingComponent || <Loading />;
    }

    if (scriptState === PromiseState.failed) {
      return <div>Error loading resources.</div>;
    }

    return this.props.children; // Render children when resources are loaded
  }
}

export default UMDLoader;