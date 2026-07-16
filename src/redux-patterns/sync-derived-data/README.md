# Syncing source-of-truth data with derived data

**Problem.** You get `data` from the backend and must preserve its exact
structure (it's the payload you send back). Separately, you need extra info
fetched _based on_ that data — e.g. user objects looked up by `ownerId`. Keeping
a second, parallel "derived" object in sync with `data` by hand (update derived
after every data change) is error-prone and drifts.

**Insight.** The extra info isn't _derived from_ `data` — users are their own
entities that `data` merely _references by id_. So don't mirror `data`. Keep a
flat cache keyed by id and **join on read**. Then there is nothing to "sync":

1. **`data`** — single source of truth, never polluted → stays a correct payload.
2. **`users.byId`** — flat normalized cache, not shaped like `data`.
3. **selector** — memoized join (`selectItemsWithOwners`) recomputes from current
   `data` on every read, so it can't drift.
4. **listener middleware** — the _one_ place that reacts to `data` changing and
   fetches missing users. Replaces scattered manual sequencing.

```
dataSlice.ts     source-of-truth data (setData/patchItem/addItem)
usersSlice.ts    byId cache + fetchUser thunk (dedupes via `condition`)
selectors.ts     memoized join + "which users are missing" selectors
listener.ts      reacts to any data mutation → dispatches fetches for missing ids
store.ts         wires the listener middleware into the store
sync.test.ts     proves derived data appears automatically, data stays pure
```

## Why this kills the error class

The rule "when data changes, refresh derived info" lives in exactly one listener
instead of at every call site, so it can't be forgotten. Dedupe lives in the
thunk's `condition`, so callers never check-before-dispatch. The payload stays
correct because `data` is never touched.

## Alternative: RTK Query

If you're on RTK Query, define a `getUser(id)` endpoint and request users by id
from components/selectors. RTKQ caches by id and dedupes automatically, so you
drop `usersSlice` + `listener` entirely — the cache-keyed-by-id + join-on-read
idea is the same, just managed for you. Use the listener version when you're not
on RTKQ or need the fetch trigger tied to specific data mutations.
