/**
 * @readonly
 * @enum {string}
 */
const VIEWS = {
  FILES: "FILES",
  CHATS: "CHATS",
  CLIENTS: "CLIENTS",
  RUN: "RUN",
  COPILOT: "COPILOT",
  SETTINGS: "SETTINGS",
}

/**
 * @typedef {Object} ViewContext
 * @property {string} activeView - one of VIEWS
 * @property {(activeView: string) => void} setActiveView
 * @property {boolean} isSidebarOpen
 * @property {(isSidebarOpen: boolean) => void} setIsSidebarOpen
 * @property {{ [key: string]: JSX.Element }} viewComponents
 * @property {{ [key: string]: JSX.Element }} viewIcons
 */

export { VIEWS }
/** @typedef {import('./view.js').ViewContext} ViewContext */

