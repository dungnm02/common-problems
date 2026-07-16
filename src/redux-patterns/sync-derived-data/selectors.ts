import { createSelector } from "@reduxjs/toolkit";
import type { Item } from "./dataSlice";
import type { User, UsersState } from "./usersSlice";

/**
 * The join happens HERE, on read — not in a reducer. This is what removes the
 * manual "update derived after updating data" sequencing: the joined view is
 * recomputed from the current `data` every time either slice changes, so it can
 * never drift. `createSelector` memoizes, so it only recomputes when inputs change.
 */

export interface RootLike {
  data: { items: Item[] };
  users: UsersState;
}

export interface ItemWithOwner extends Item {
  owner: User | undefined; // undefined until the user has been fetched
}

const selectItems = (s: RootLike) => s.data.items;
const selectUsersById = (s: RootLike) => s.users.byId;

export const selectItemsWithOwners = createSelector(
  [selectItems, selectUsersById],
  (items, usersById): ItemWithOwner[] =>
    items.map((item) => ({ ...item, owner: usersById[item.ownerId] })),
);

/** All distinct owner ids currently referenced by `data`. */
export const selectReferencedUserIds = createSelector([selectItems], (items) => [
  ...new Set(items.map((i) => i.ownerId)),
]);

/** Owner ids that are referenced but not yet cached or in flight. */
export const selectMissingUserIds = createSelector(
  [selectReferencedUserIds, (s: RootLike) => s.users],
  (ids, users) => ids.filter((id) => !users.byId[id] && !users.pending[id]),
);
