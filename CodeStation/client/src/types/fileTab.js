// file-tab.js (or fileTab.js)

/**
 * @typedef {import("./file").FileSystemItem} FileSystemItem
 */

/**
 * @typedef {Object} FileTabContext
 * @property {FileSystemItem|null} activeFile
 * @property {(file: FileSystemItem) => void} setActiveFile
 * @property {(fileId: string) => void} changeActiveFile
 */

// Export the typedef (for reference or tooling purposes only)
export {}

