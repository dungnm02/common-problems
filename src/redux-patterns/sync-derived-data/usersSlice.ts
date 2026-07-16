import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/**
 * The derived-data cache. It is a flat lookup keyed by user id — deliberately
 * NOT shaped like `data`. Because it is keyed by id, it never has to be kept
 * "in sync" with the structure of `data`; it is simply joined against `data`
 * on read (see selectors.ts).
 */

export interface User {
  id: string;
  name: string;
}

export interface UsersState {
  byId: Record<string, User>;
  pending: Record<string, boolean>;
}

const initialState: UsersState = { byId: {}, pending: {} };

// Stand-in for a real API call (e.g. GET /users/:id).
async function apiFetchUser(id: string): Promise<User> {
  return { id, name: `User ${id}` };
}

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  (id: string) => apiFetchUser(id),
  {
    // Skip if we already have it or a request is already in flight. Dedupe
    // lives here so callers never have to check before dispatching.
    condition: (id, { getState }) => {
      const { users } = getState() as { users: UsersState };
      return !users.byId[id] && !users.pending[id];
    },
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state, action) => {
        state.pending[action.meta.arg] = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        const user = action.payload;
        state.byId[user.id] = user;
        delete state.pending[user.id];
      })
      .addCase(fetchUser.rejected, (state, action) => {
        delete state.pending[action.meta.arg];
      });
  },
});

export default usersSlice.reducer;
