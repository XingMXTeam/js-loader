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

  // 缓存已加载的资源
  loadedResources = new Set();

  componentDidMount() {
    this.loadResources();
  }

  componentDidUpdate(prevProps) {
    // 检查 jsCdnAddress 是否变化
    if (prevProps.jsCdnAddress !== this.props.jsCdnAddress) {
      this.loadResources(); // 重新加载资源
    }
  }

  get resourceUrls() {
    const { jsCdnAddress = [], cssCdnAddress = [] } = this.props;
    const jsUrls = typeof jsCdnAddress === 'string' ? [jsCdnAddress] : jsCdnAddress;
    const cssUrls = typeof cssCdnAddress === 'string' ? [cssCdnAddress] : cssCdnAddress;
    return [...jsUrls.map((url) => ({ type: 'JAVASCRIPT', url })), ...cssUrls.map((url) => ({ type: 'CSS', url }))];
  }

  loadResources = () => {
    const { npmPackages = [] } = this.props;
    const resourceUrls = this.resourceUrls;

    if (!resourceUrls.length) {
      this.setState({ scriptState: PromiseState.failed });
      return;
    }
    const promises = [];

    // 加载 npm 包
    npmPackages.forEach((pkg) => {
      promises.push(import(pkg)); // 使用动态 import 加载 npm 包
    });

    // 加载外部资源
    resourceUrls.forEach(({ url, type }) => {
      // 检查是否已经加载过该资源
      if (this.loadedResources.has(url)) {
        promises.push(Promise.resolve()); // 如果已加载，返回已解决的 Promise
      }

      // 如果未加载，添加到缓存并加载资源
      this.loadedResources.add(url);
      const loadFn = type === 'CSS' ? loadStyle : loadScript;
      promises.push(loadFn(url));
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
