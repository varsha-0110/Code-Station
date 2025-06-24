/**
 * @readonly
 * @enum {string}
 */
const USER_CONNECTION_STATUS = {
  OFFLINE: "offline",
  ONLINE: "online",
}

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} roomId
 */

/**
 * @typedef {User & {
 *   status: "offline" | "online",
 *   cursorPosition: number,
 *   typing: boolean,
 *   currentFile: string,
 *   socketId: string
 * }} RemoteUser
 */

/**
 * @readonly
 * @enum {string}
 */
const USER_STATUS = {
  INITIAL: "initial",
  CONNECTING: "connecting",
  ATTEMPTING_JOIN: "attempting-join",
  JOINED: "joined",
  CONNECTION_FAILED: "connection-failed",
  DISCONNECTED: "disconnected",
}

export { USER_CONNECTION_STATUS, USER_STATUS }
/** @typedef {import('./user.js').RemoteUser} RemoteUser */
/** @typedef {import('./user.js').User} User */

