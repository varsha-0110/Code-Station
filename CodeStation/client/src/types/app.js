import { createTLStore } from "@tldraw/editor"; // ✅ often the correct source

// Create a new store instance
const store = createTLStore();

// Get raw records from the store (this is your "snapshot")
const snapshot = Object.fromEntries(store.records.entries());

// Now you can use `snapshot` however you need (e.g. save it, send it, etc.)
console.log(snapshot);

import { USER_STATUS } from "./user"

/** @typedef {import("./user").RemoteUser} RemoteUser */
/** @typedef {import("./user").User} User */
/** @typedef {StoreSnapshot<TLRecord> | null} DrawingData */

const ACTIVITY_STATE = {
  CODING: "coding",
  DRAWING: "drawing",
}

// This is a structure definition for reference
// No need to export an `AppContext` type in JS — it's handled at runtime
// Use JSDoc for documentation and editor support

/**
 * @typedef {Object} AppContext
 * @property {RemoteUser[]} users
 * @property {(users: RemoteUser[] | ((users: RemoteUser[]) => RemoteUser[])) => void} setUsers
 * @property {User} currentUser
 * @property {(user: User) => void} setCurrentUser
 * @property {string} status - One of USER_STATUS
 * @property {(status: string) => void} setStatus
 * @property {string} activityState - One of ACTIVITY_STATE
 * @property {(state: string) => void} setActivityState
 * @property {DrawingData} drawingData
 * @property {(data: DrawingData) => void} setDrawingData
 */

export { ACTIVITY_STATE }
