
export const loadScript = (url, globalName) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            let module = globalName ? window[globalName] : undefined;
            if (void 0 === module) {
                module = Object.values(window).pop();
            }
            // if module is promise, resolve it
            if (module && module.then) {
                module.then(resolve);
            } else {
                resolve(module);
            }
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.body.appendChild(script);
    });
};