import { deletePantry, getPantry, patchPantry, postPantry } from "../api/client.js";

export const pantryInitialState = {
  items: [],
  status: "idle",
  error: "",
};

export function pantryReducer(state = pantryInitialState, action) {
  switch (action.type) {
    case "pantry/requestStarted":
      return { ...state, status: "loading", error: "" };
    case "pantry/loadSucceeded":
      return {
        ...state,
        status: "succeeded",
        error: "",
        items: action.payload.items || [],
      };
    case "pantry/requestFailed":
      return { ...state, status: "failed", error: action.payload };
    case "pantry/reset":
      return pantryInitialState;
    default:
      return state;
  }
}

export function resetPantry() {
  return { type: "pantry/reset" };
}

export function fetchPantry() {
  return async (dispatch, getState) => {
    dispatch({ type: "pantry/requestStarted" });
    try {
      const token = getState().auth.token;
      const data = await getPantry(token);
      dispatch({ type: "pantry/loadSucceeded", payload: data });
    } catch (error) {
      dispatch({ type: "pantry/requestFailed", payload: error.message });
    }
  };
}

function withReload(apiCall) {
  return (...args) => async (dispatch, getState) => {
    dispatch({ type: "pantry/requestStarted" });
    try {
      const token = getState().auth.token;
      await apiCall(token, ...args);
      const data = await getPantry(token);
      dispatch({ type: "pantry/loadSucceeded", payload: data });
    } catch (error) {
      dispatch({ type: "pantry/requestFailed", payload: error.message });
      throw error;
    }
  };
}

export const addPantryItem = withReload(postPantry);
export const updatePantryItem = withReload(patchPantry);
export const removePantryItem = withReload(deletePantry);
