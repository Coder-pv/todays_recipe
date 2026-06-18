import { getProfile, putProfile } from "../api/client.js";

export const DEFAULT_PROFILE_FORM = {
  username: "",
  password: "",
  dietaryPreference: "vegetarian",
  allergiesText: "",
  healthGoal: "maintenance",
  dailyCalorieTarget: 2000,
  mealsPerDay: 3,
  mealPattern: "breakfast_lunch_dinner",
  mealDistribution: "balanced",
  defaultServingPeople: 2,
};

export const profileInitialState = {
  data: null,
  form: DEFAULT_PROFILE_FORM,
  status: "idle",
  error: "",
  saveMessage: "",
};

export function mapProfileToForm(profile) {
  if (!profile) {
    return DEFAULT_PROFILE_FORM;
  }

  return {
    username: profile.username || "",
    password: "",
    dietaryPreference: profile.dietaryPreference || "vegetarian",
    allergiesText: (profile.allergies || []).join(", "),
    healthGoal: profile.healthGoal || "maintenance",
    dailyCalorieTarget: profile.dailyCalorieTarget ?? 2000,
    mealsPerDay: profile.mealsPerDay ?? 3,
    mealPattern: profile.mealPattern || "breakfast_lunch_dinner",
    mealDistribution: profile.mealDistribution || "balanced",
    defaultServingPeople: profile.defaultServingPeople ?? 2,
  };
}

export function profileReducer(state = profileInitialState, action) {
  switch (action.type) {
    case "profile/requestStarted":
      return { ...state, status: "loading", error: "", saveMessage: "" };
    case "profile/loadSucceeded":
      return {
        ...state,
        status: "succeeded",
        error: "",
        data: action.payload,
        form: mapProfileToForm(action.payload),
      };
    case "profile/requestFailed":
      return { ...state, status: "failed", error: action.payload, saveMessage: "" };
    case "profile/formUpdated":
      return { ...state, form: { ...state.form, ...action.payload } };
    case "profile/saveSucceeded":
      return {
        ...state,
        status: "succeeded",
        error: "",
        saveMessage: "Saved.",
        data: action.payload,
        form: mapProfileToForm(action.payload),
      };
    case "profile/reset":
      return profileInitialState;
    default:
      return state;
  }
}

export function updateProfileForm(payload) {
  return { type: "profile/formUpdated", payload };
}

export function resetProfile() {
  return { type: "profile/reset" };
}

export function fetchProfile() {
  return async (dispatch, getState) => {
    dispatch({ type: "profile/requestStarted" });
    try {
      const token = getState().auth.token;
      const profile = await getProfile(token);
      dispatch({ type: "profile/loadSucceeded", payload: profile });
    } catch (error) {
      dispatch({ type: "profile/requestFailed", payload: error.message });
    }
  };
}

export function saveProfile() {
  return async (dispatch, getState) => {
    dispatch({ type: "profile/requestStarted" });
    try {
      const { auth, profile } = getState();
      const allergies = profile.form.allergiesText
        .split(/[,;\n]/)
        .map((entry) => entry.trim())
        .filter(Boolean);

      const payload = {
        username: profile.form.username,
        password: profile.form.password,
        dietaryPreference: profile.form.dietaryPreference,
        allergies,
        healthGoal: profile.form.healthGoal,
        dailyCalorieTarget: Number(profile.form.dailyCalorieTarget),
        mealsPerDay: Number(profile.form.mealsPerDay),
        mealPattern: profile.form.mealPattern,
        mealDistribution: profile.form.mealDistribution,
        defaultServingPeople: Number(profile.form.defaultServingPeople),
      };

      const saved = await putProfile(auth.token, payload);
      dispatch({ type: "profile/saveSucceeded", payload: saved });
      dispatch({
        type: "auth/sessionRestored",
        payload: {
          token: auth.token,
          user: saved,
        },
      });
    } catch (error) {
      dispatch({ type: "profile/requestFailed", payload: error.message });
      throw error;
    }
  };
}
