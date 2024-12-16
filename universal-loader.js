// universal-loader.js
import React, { Component } from 'react';
import { loadStyle } from './load-style';
import { loadScript } from './load-script';
import { Loading } from '@alifd/next';

const PromiseState = {
  loading: 'loading',
  success: 'success',
  failed: 'failed',
};

export class UniversalLoader extends Component {
  state = {
    scriptState: PromiseState.loading,
    module: null,
  };

  loadedResources = new Set();

  componentDidMount() {
    this.loadResources();
  }

  componentDidUpdate(prevProps) {
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

  loadResources = async () => {
    const { npmPackages = [], moduleUrl } = this.props;
    const resourceUrls = this.resourceUrls;

    if (!resourceUrls.length && !npmPackages.length && !moduleUrl) {
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
      if (this.loadedResources.has(url)) {
        promises.push(Promise.resolve()); // 如果已加载，返回已解决的 Promise
      }

      this.loadedResources.add(url);
      const loadFn = type === 'CSS' ? loadStyle : loadScript;
      promises.push(loadFn(url));
    });

    // 加载 ES 模块
    if (moduleUrl) {
      promises.push(import(moduleUrl).then(module => {
        this.setState({ module });
      }));
    }

    Promise.all(promises)
      .then(() => {
        this.setState({ scriptState: PromiseState.success });
      })
      .catch(() => {
        this.setState({ scriptState: PromiseState.failed });
      });
  };

  render() {
    const { scriptState, module } = this.state;
    const { loadingComponent, children, fallback } = this.props;

    if (scriptState === PromiseState.loading) {
      return loadingComponent || <Loading />;
    }

    if (scriptState === PromiseState.failed) {
      return fallback || <div>Error loading resources.</div>;
    }

    return children(module); // Render children with the loaded module
  }
}

export default UniversalLoader;