// amd-loader.js
import React, { Component } from 'react';
import { loadStyle } from './load-style';
import { loadScript } from './load-script';

const wrapperAppComponent = (options) => (WrappedComponent) => {
    return class AppLoader extends Component {
        state = {
            loading: true,
            error: null,
        };

        componentDidMount() {
            const { jsCdnAddress, cssCdnAddress } = options;
            const promises = [];

            if (cssCdnAddress) {
                promises.push(loadStyle(cssCdnAddress));
            }

            if (jsCdnAddress) {
                promises.push(loadScript(jsCdnAddress));
            }

            Promise.all(promises)
                .then(() => {
                    this.setState({ loading: false });
                })
                .catch((error) => {
                    this.setState({ loading: false, error });
                });
        }

        render() {
            const { loading, error } = this.state;

            if (loading) {
                return <div>Loading...</div>;
            }

            if (error) {
                return <div>Error loading resources: {error.message}</div>;
            }

            return <WrappedComponent {...this.props} />;
        }
    };
};

export default wrapperAppComponent;