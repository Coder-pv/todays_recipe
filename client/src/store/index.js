import { authReducer } from "./authSlice.js";
import { pantryReducer } from "./pantrySlice.js";
import { planReducer } from "./planSlice.js";
import { profileReducer } from "./profileSlice.js";
import { combineReducers, createStore } from "./redux.js";

export const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  pantry: pantryReducer,
  plan: planReducer,
});

export function createAppStore() {
  return createStore(rootReducer);
}
