import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setData, patchItem, addItem } from "./dataSlice";
import { fetchUser } from "./usersSlice";
import { selectMissingUserIds, type RootLike } from "./selectors";

/**
 * This is the ONE place that reacts to `data` changing. Instead of every call
 * site remembering to refresh derived info, a single listener watches any
 * action that mutates `data`, computes which users are now missing, and fetches
 * them. The error-prone manual sequencing collapses into this one rule.
 */

export const usersSyncListener = createListenerMiddleware();

usersSyncListener.startListening({
  // Any action that can change which users `data` references.
  matcher: isAnyOf(setData, patchItem, addItem),
  effect: (_action, api) => {
    const missing = selectMissingUserIds(api.getState() as RootLike);
    // fetchUser's `condition` also dedupes, so concurrent dispatches are safe.
    missing.forEach((id) => api.dispatch(fetchUser(id)));
  },
});
