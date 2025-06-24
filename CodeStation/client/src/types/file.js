/**
 * @typedef {Object} FileSystemItem
 * @property {string} id
 * @property {string} name
 * @property {"file" | "directory"} type
 * @property {FileSystemItem[]=} children
 * @property {string=} content
 * @property {boolean=} isOpen
 */

/**
 * @typedef {Object} FileContext
 * @property {FileSystemItem} fileStructure
 * @property {FileSystemItem[]} openFiles
 * @property {FileSystemItem|null} activeFile
 * @property {(file: FileSystemItem) => void} setActiveFile
 * @property {(fileId: string) => void} closeFile
 * @property {(dirId: string) => void} toggleDirectory
 * @property {() => void} collapseDirectories
 * @property {(parentDirId: string, name: string) => string} createDirectory
 * @property {(dirId: string, children: FileSystemItem[]) => void} updateDirectory
 * @property {(dirId: string, newName: string) => void} renameDirectory
 * @property {(dirId: string) => void} deleteDirectory
 * @property {(parentDirId: string, name: string) => string} createFile
 * @property {(fileId: string, content: string) => void} updateFileContent
 * @property {(fileId: string) => void} openFile
 * @property {(fileId: string, newName: string) => boolean} renameFile
 * @property {(fileId: string) => void} deleteFile
 * @property {() => void} downloadFilesAndFolders
 */

