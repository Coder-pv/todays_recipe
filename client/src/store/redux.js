import { createContext, createElement, useContext, useMemo, useRef, useSyncExternalStore } from "react";

const StoreContext = createContext(null);

export function combineReducers(reducers) {
  return (state = {}, action) => {
    let changed = false;
    const nextState = {};

    for (const [key, reducer] of Object.entries(reducers)) {
      nextState[key] = reducer(state[key], action);
      changed = changed || nextState[key] !== state[key];
    }

    return changed ? nextState : state;
  };
}

export function createStore(reducer, preloadedState) {
  let state = reducer(preloadedState, { type: "@@INIT" });
  const listeners = new Set();

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function baseDispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
    return action;
  }

  function dispatch(action) {
    if (typeof action === "function") {
      return action(dispatch, getState);
    }
    return baseDispatch(action);
  }

  return {
    getState,
    dispatch,
    subscribe,
  };
}

export function StoreProvider({ store, children }) {
  const stableStore = useMemo(() => store, [store]);
  return createElement(StoreContext.Provider, { value: stableStore }, children);
}

export function useDispatch() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is missing");
  return store.dispatch;
}

export function useSelector(selector) {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is missing");
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()), () =>
    selector(store.getState())
  );
}

export function useStoreRef(factory) {
  const ref = useRef(null);
  if (!ref.current) {
    ref.current = factory();
  }
  return ref.current;
}
