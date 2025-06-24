/**
 * @typedef {Object} FileSystemHandle
 * @property {"file" | "directory"} kind
 * @property {string} name
 */

/**
 * @typedef {Object} GetFileHandleOptions
 * @property {boolean=} create
 */

/**
 * @typedef {Object} GetDirectoryHandleOptions
 * @property {boolean=} create
 */

/**
 * @typedef {Object} FileSystemRemoveOptions
 * @property {boolean=} recursive
 */

/**
 * @typedef {FileSystemHandle & {
 *   getFile: () => Promise<File>
 * }} FileSystemFileHandle
 */

/**
 * @typedef {FileSystemHandle & {
 *   getFileHandle: (name: string, options?: GetFileHandleOptions) => Promise<FileSystemFileHandle>,
 *   getDirectoryHandle: (name: string, options?: GetDirectoryHandleOptions) => Promise<FileSystemDirectoryHandle>,
 *   removeEntry: (name: string, options?: FileSystemRemoveOptions) => Promise<void>,
 *   resolve: (descendant: FileSystemHandle) => Promise<string[] | null>,
 *   entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>,
 *   values: () => AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>
 * }} FileSystemDirectoryHandle
 */

/**
 * @typedef {Object} WindowWithDirectoryPicker
 * @property {() => Promise<FileSystemDirectoryHandle>} showDirectoryPicker
 */

// You can optionally extend the window object like this:
if (typeof window !== "undefined" && !window.showDirectoryPicker) {
  // Polyfill or warning
  console.warn("showDirectoryPicker is not supported in this browser.")
}

