import { getPlan, patchMealComplete, postGeneratePlan } from "../api/client.js";

export const planInitialState = {
  data: null,
  status: "idle",
  error: "",
  note: "",
};

function normalizePlanResponse(data) {
  if (!data) return null;
  const { pantryUpdate, pantryRestored, ...rest } = data;
  return rest;
}

export function planReducer(state = planInitialState, action) {
  switch (action.type) {
    case "plan/requestStarted":
      return { ...state, status: "loading", error: "", note: "" };
    case "plan/loadSucceeded":
      return { ...state, status: "succeeded", error: "", data: action.payload };
    case "plan/requestFailed":
      return { ...state, status: "failed", error: action.payload };
    case "plan/noteUpdated":
      return { ...state, note: action.payload };
    case "plan/reset":
      return planInitialState;
    default:
      return state;
  }
}

export function resetPlan() {
  return { type: "plan/reset" };
}

export function fetchPlan(date) {
  return async (dispatch, getState) => {
    dispatch({ type: "plan/requestStarted" });
    try {
      const token = getState().auth.token;
      const plan = await getPlan(token, date);
      dispatch({ type: "plan/loadSucceeded", payload: plan });
    } catch (error) {
      dispatch({ type: "plan/requestFailed", payload: error.message });
    }
  };
}

export function generatePlan(date, servingPeople) {
  return async (dispatch, getState) => {
    dispatch({ type: "plan/requestStarted" });
    try {
      const token = getState().auth.token;
      const plan = await postGeneratePlan(token, date, servingPeople);
      dispatch({ type: "plan/loadSucceeded", payload: plan });
      dispatch({
        type: "plan/noteUpdated",
        payload:
          plan.source === "stub"
            ? `Template plan generated. ${plan.fallbackReason || "Add an LLM API key to generate with AI."}`
            : `Generated with ${plan.source === "openai" ? "OpenAI" : "OpenRouter"} AI.`,
      });
    } catch (error) {
      dispatch({ type: "plan/requestFailed", payload: error.message });
      throw error;
    }
  };
}

export function toggleMeal(date, slot, completed) {
  return async (dispatch, getState) => {
    dispatch({ type: "plan/requestStarted" });
    try {
      const token = getState().auth.token;
      const plan = await patchMealComplete(token, date, slot, completed);
      dispatch({ type: "plan/loadSucceeded", payload: normalizePlanResponse(plan) });
      dispatch({
        type: "plan/noteUpdated",
        payload: completed ? "Meal marked complete." : "Meal unchecked and pantry restored.",
      });
    } catch (error) {
      dispatch({ type: "plan/requestFailed", payload: error.message });
      throw error;
    }
  };
}
