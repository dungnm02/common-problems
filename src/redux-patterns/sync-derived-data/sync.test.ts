import { describe, expect, it } from "vitest";
import { createAppStore } from "./store";
import { setData, addItem, patchItem } from "./dataSlice";
import { selectItemsWithOwners } from "./selectors";

// Let the listener's dispatched fetchUser thunks resolve and their reducers run.
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("sync source-of-truth data with a derived users cache", () => {
  it("fetches referenced users automatically when data is set (no manual sync)", async () => {
    const store = createAppStore();

    store.dispatch(
      setData({
        items: [
          { id: "1", title: "A", ownerId: "u1" },
          { id: "2", title: "B", ownerId: "u2" },
        ],
      }),
    );
    await flush();

    const joined = selectItemsWithOwners(store.getState());
    expect(joined.map((i) => i.owner?.name)).toEqual(["User u1", "User u2"]);
  });

  it("joins on read: data stays pure, owners come from the cache", async () => {
    const store = createAppStore();
    store.dispatch(setData({ items: [{ id: "1", title: "A", ownerId: "u1" }] }));
    await flush();

    // The source-of-truth data is never polluted with the resolved user object,
    // so it remains a correct payload to send back.
    expect(store.getState().data.items[0]).toEqual({
      id: "1",
      title: "A",
      ownerId: "u1",
    });
    expect(selectItemsWithOwners(store.getState())[0].owner).toEqual({
      id: "u1",
      name: "User u1",
    });
  });

  it("fetches the new owner when an item is added later", async () => {
    const store = createAppStore();
    store.dispatch(setData({ items: [{ id: "1", title: "A", ownerId: "u1" }] }));
    await flush();

    store.dispatch(addItem({ id: "2", title: "B", ownerId: "u2" }));
    await flush();

    expect(store.getState().users.byId).toHaveProperty("u2");
  });

  it("fetches the new owner when an item's ownerId changes", async () => {
    const store = createAppStore();
    store.dispatch(setData({ items: [{ id: "1", title: "A", ownerId: "u1" }] }));
    await flush();

    store.dispatch(patchItem({ id: "1", changes: { ownerId: "u9" } }));
    await flush();

    expect(store.getState().users.byId).toHaveProperty("u9");
    // Old owner u1 is still cached; harmless. Join reflects the current ownerId.
    expect(selectItemsWithOwners(store.getState())[0].owner?.id).toBe("u9");
  });

  it("does not refetch users already in the cache (dedupe)", async () => {
    const store = createAppStore();
    store.dispatch(setData({ items: [{ id: "1", title: "A", ownerId: "u1" }] }));
    await flush();

    // Two items share owner u1; no duplicate fetch, and u1 is already cached.
    store.dispatch(
      setData({
        items: [
          { id: "1", title: "A", ownerId: "u1" },
          { id: "2", title: "B", ownerId: "u1" },
        ],
      }),
    );
    await flush();

    expect(Object.keys(store.getState().users.byId)).toEqual(["u1"]);
  });
});
