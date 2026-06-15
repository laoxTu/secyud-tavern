// import 'react/jsx-runtime' → 从宿主获取 + 自动补 key
const React = window.__PLUGIN_REACT__;
const Fragment = React.Fragment;

let _k = 0;
function autoKey(props) {
    if (!props || "key" in props) return props;
    return Object.assign({}, props, { key: `_${_k++}` });
}

export function jsx(type, props) {
    return React.createElement(type, autoKey(props));
}

export function jsxs(type, props) {
    return React.createElement(type, autoKey(props));
}

export { Fragment };
