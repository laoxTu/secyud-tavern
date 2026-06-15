// import 'react' → 从宿主获取（保证单例，避免 hooks 失效）
const React = window.__PLUGIN_REACT__;
export default React;
export const {
    Children, Component, Fragment, Profiler, PureComponent,
    StrictMode, Suspense, act, cache, cloneElement,
    createContext, createElement, createRef,
    forwardRef, isValidElement, lazy, memo,
    startTransition, useCallback, useContext,
    useDebugValue, useDeferredValue, useEffect,
    useId, useImperativeHandle, useInsertionEffect,
    useLayoutEffect, useMemo, useOptimistic,
    useReducer, useRef, useState, useSyncExternalStore,
    useTransition, useActionState,
    version,
} = React;
