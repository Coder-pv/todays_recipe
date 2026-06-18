import { getCurrentUser, loginUser, registerUser } from "../api/client.js";

export const AUTH_TOKEN_KEY = "tr_auth_token";

export const authInitialState = {
  token: "",
  user: null,
  status: "anonymous",
  error: "",
  mode: "login",
};

export function authReducer(state = authInitialState, action) {
  switch (action.type) {
    case "auth/setMode":
      return { ...state, mode: action.payload };
    case "auth/requestStarted":
      return { ...state, status: "loading", error: "" };
    case "auth/requestFailed":
      return { ...state, status: "anonymous", error: action.payload };
    case "auth/sessionRestored":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        status: "authenticated",
        error: "",
      };
    case "auth/loggedOut":
      return { ...authInitialState, mode: state.mode };
    default:
      return state;
  }
}

export function setAuthMode(mode) {
  return { type: "auth/setMode", payload: mode };
}

function persistToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function bootstrapAuth() {
  return async (dispatch) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
     console.log("Found token:", token); 
    if (!token) {
      dispatch({ type: "auth/loggedOut" });
      return;
    }

    dispatch({ type: "auth/requestStarted" });
    console.log("Calling getCurrentUser..."); // DEBUG 2
    try {
      const data = await getCurrentUser(token);
      console.log("Data received:", data); 
      dispatch({
        type: "auth/sessionRestored",
        payload: {
          token,
          user: data.user,
        },
      });
    } catch (error) {
      console.error("Auth error:", error);
      persistToken("");
      dispatch({ type: "auth/requestFailed", payload: error.message });
    }
  };
}

function createAuthThunk(apiCall) {
  return (credentials) => async (dispatch) => {
    dispatch({ type: "auth/requestStarted" });
    try {
      const data = await apiCall(credentials);
      console.log("SERVER RESPONSE DATA:", data); 
      persistToken(data.token);
      dispatch({
        type: "auth/sessionRestored",
        payload: {
          token: data.token,
          user: data.user,
        },
      });
      return data.user;
    } catch (error) {
      dispatch({ type: "auth/requestFailed", payload: error.message });
      throw error;
    }
  };
}

export const login = createAuthThunk(loginUser);
export const register = createAuthThunk(registerUser);

export function logout() {
  persistToken("");
  status: "anonymous";
  return { type: "auth/loggedOut" };
}
