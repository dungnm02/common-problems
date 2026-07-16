import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * The "true" data from the backend. This is the single source of truth and is
 * the exact structure we send back as a payload, so we NEVER pollute it with
 * derived info (like resolved user objects). It only references users by id.
 */

export interface Item {
  id: string;
  title: string;
  ownerId: string;
}

export interface Data {
  items: Item[];
}

const initialState: Data = { items: [] };

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    // Replace the whole payload (e.g. after a GET from the backend).
    setData(_state, action: PayloadAction<Data>) {
      return action.payload;
    },
    // Mutate a single item's structure-preserving fields.
    patchItem(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Omit<Item, "id">> }>,
    ) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) Object.assign(item, action.payload.changes);
    },
    addItem(state, action: PayloadAction<Item>) {
      state.items.push(action.payload);
    },
  },
});

export const { setData, patchItem, addItem } = dataSlice.actions;
export default dataSlice.reducer;
