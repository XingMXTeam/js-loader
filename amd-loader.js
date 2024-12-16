// amd-loader.js
(function (global) {
    var modules = {};

    function define(name, deps, factory) {
        for (var i = 0; i < deps.length; i++) {
            deps[i] = modules[deps[i]];
        }
        modules[name] = factory.apply(null, deps);
    }

    function require(deps, callback) {
        var args = [];
        for (var i = 0; i < deps.length; i++) {
            args.push(modules[deps[i]]);
        }
        callback.apply(null, args);
    }

    global.amdLoader = {
        define: define,
        require: require
    };
})(this);