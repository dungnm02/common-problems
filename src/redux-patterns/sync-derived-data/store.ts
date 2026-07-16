import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./dataSlice";
import usersReducer from "./usersSlice";
import { usersSyncListener } from "./listener";

export function createAppStore() {
  return configureStore({
    reducer: {
      data: dataReducer,
      users: usersReducer,
    },
    middleware: (getDefault) =>
      // prepend so the listener sees actions before they hit the reducers'
      // downstream effects; it reads post-update state via api.getState().
      getDefault().prepend(usersSyncListener.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
