import { SocketEvent } from "@/types/socket"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import {
    findParentDirectory,
    getFileById,
    initialFileStructure,
    isFileExist,
} from "@/utils/file"
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useAppContext } from "./AppContext"
import { useSocket } from "./SocketContext"

const FileContext = createContext(null)

export const useFileSystem = () => {
    const context = useContext(FileContext)
    if (!context) {
        throw new Error("useFileSystem must be used within FileContextProvider")
    }
    return context
}

function FileContextProvider({ children }) {
    const { socket } = useSocket()
    const { setUsers, drawingData } = useAppContext()

    const [fileStructure, setFileStructure] = useState(initialFileStructure)
    const [openFiles, setOpenFiles] = useState([])
    const [activeFile, setActiveFile] = useState(null)

    const toggleDirectory = (dirId) => {
        const toggleDir = (directory) => {
            if (directory.id === dirId) {
                return { ...directory, isOpen: !directory.isOpen }
            } else if (directory.children) {
                return {
                    ...directory,
                    children: directory.children.map(toggleDir),
                }
            }
            return directory
        }
        setFileStructure(prev => {
            const updated = toggleDir(prev)
            // Recompute openFiles and activeFile from the new structure
            const newOpenFiles = openFiles.map(f => getFileById(updated, f.id)).filter(Boolean)
            const newActiveFile = activeFile ? getFileById(updated, activeFile.id) : null
            setOpenFiles(newOpenFiles)
            setActiveFile(newActiveFile)
            socket.emit(SocketEvent.SYNC_FILE_STRUCTURE, {
                fileStructure: updated,
                openFiles: newOpenFiles,
                activeFile: newActiveFile,
            })
            return updated
        })
    }

    const collapseDirectories = () => {
        const collapseDir = (directory) => ({
            ...directory,
            isOpen: false,
            children: directory.children?.map(collapseDir),
        })
        setFileStructure(prev => {
            const updated = collapseDir(prev)
            // Recompute openFiles and activeFile from the new structure
            const newOpenFiles = openFiles.map(f => getFileById(updated, f.id)).filter(Boolean)
            const newActiveFile = activeFile ? getFileById(updated, activeFile.id) : null
            setOpenFiles(newOpenFiles)
            setActiveFile(newActiveFile)
            socket.emit(SocketEvent.SYNC_FILE_STRUCTURE, {
                fileStructure: updated,
                openFiles: newOpenFiles,
                activeFile: newActiveFile,
            })
            return updated
        })
    }

    const createDirectory = useCallback((parentDirId, newDir, sendToSocket = true) => {
        let newDirectory =
            typeof newDir === "string"
                ? { id: uuidv4(), name: newDir, type: "directory", children: [], isOpen: false }
                : newDir

        if (!parentDirId) parentDirId = fileStructure.id

        const addDirectory = (directory) => {
            if (directory.id === parentDirId) {
                return { ...directory, children: [...(directory.children || []), newDirectory] }
            } else if (directory.children) {
                return { ...directory, children: directory.children.map(addDirectory) }
            }
            return directory
        }

        setFileStructure(prev => addDirectory(prev))

        if (!sendToSocket) return newDirectory.id
        socket.emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory })

        return newDirectory.id
    }, [fileStructure.id, socket])

    const updateDirectory = useCallback((dirId, children, sendToSocket = true) => {
        if (!dirId) dirId = fileStructure.id

        const updateChildren = (directory) => {
            if (directory.id === dirId) return { ...directory, children }
            else if (directory.children) {
                return { ...directory, children: directory.children.map(updateChildren) }
            }
            return directory
        }

        setFileStructure(prev => updateChildren(prev))
        setOpenFiles([])
        setActiveFile(null)

        if (dirId === fileStructure.id) {
            toast.dismiss()
            toast.success("Files and folders updated")
        }

        if (!sendToSocket) return
        socket.emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children })
    }, [fileStructure.id, socket])

    const renameDirectory = useCallback((dirId, newDirName, sendToSocket = true) => {
        const renameDir = (directory) => {
            if (directory.type === "directory" && directory.children) {
                const isTaken = directory.children.some(
                    (item) => item.type === "directory" && item.name === newDirName && item.id !== dirId
                )
                if (isTaken) return null

                return {
                    ...directory,
                    children: directory.children.map((item) => {
                        if (item.id === dirId) {
                            return { ...item, name: newDirName }
                        } else if (item.type === "directory") {
                            const updated = renameDir(item)
                            return updated !== null ? updated : item
                        }
                        return item
                    }),
                }
            }
            return directory
        }

        const updated = renameDir(fileStructure)
        if (updated === null) return false

        setFileStructure(updated)
        if (!sendToSocket) return true
        socket.emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newDirName })
        return true
    }, [socket, fileStructure])

    const deleteDirectory = useCallback((dirId, sendToSocket = true) => {
        const deleteDir = (directory) => {
            if (directory.id === dirId) return null
            if (directory.children) {
                const children = directory.children
                    .map(deleteDir)
                    .filter(Boolean)
                return { ...directory, children }
            }
            return directory
        }

        setFileStructure(prev => deleteDir(prev))
        if (!sendToSocket) return
        socket.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
    }, [socket])

    const openFile = (fileId, emitSocket = true) => {
        const file = getFileById(fileStructure, fileId)
        if (file) {
            updateFileContent(activeFile?.id || "", activeFile?.content || "")
            if (!openFiles.some(f => f.id === fileId)) {
                setOpenFiles(prev => [...prev, file])
            }
            setOpenFiles(prev =>
                prev.map(f =>
                    f.id === activeFile?.id ? { ...f, content: activeFile.content || "" } : f
                )
            )
            setActiveFile(file)
            if (emitSocket && fileId !== activeFile?.id) {
                socket.emit(SocketEvent.ACTIVE_FILE_CHANGED, { fileId })
            }
        }
    }

    const closeFile = (fileId, sendToSocket = true) => {
        if (fileId === activeFile?.id) {
            updateFileContent(activeFile.id, activeFile.content || "")
            const index = openFiles.findIndex(f => f.id === fileId)
            setActiveFile(
                openFiles.length > 1
                    ? index > 0 ? openFiles[index - 1] : openFiles[index + 1]
                    : null
            )
        }
        setOpenFiles(prev => prev.filter(f => f.id !== fileId))
        if (sendToSocket) {
            socket.emit(SocketEvent.CLOSE_FILE_TAB, { fileId })
        }
    }

    const createFile = useCallback((parentDirId, file, sendToSocket = true) => {
        let num = 1
        if (!parentDirId) parentDirId = fileStructure.id
        const parentDir = findParentDirectory(fileStructure, parentDirId)
        if (!parentDir) {
            if (!sendToSocket) return null; // Fail gracefully if from socket
            throw new Error("Parent not found")
        }

        let newFile
        if (typeof file === "string") {
            let name = file
            while (isFileExist(parentDir, name)) {
                name = `${file.split(".")[0]}(${num++}).${file.split(".")[1]}`
            }
            newFile = { id: uuidv4(), name, type: "file", content: "" }
        } else {
            newFile = file
        }

        const addFile = (directory) => {
            if (directory.id === parentDir.id) {
                return {
                    ...directory,
                    children: [...(directory.children || []), newFile],
                    isOpen: true,
                }
            } else if (directory.children) {
                return {
                    ...directory,
                    children: directory.children.map(addFile),
                }
            }
            return directory
        }

        setFileStructure(prev => addFile(prev))
        setOpenFiles(prev => [...prev, newFile])
        setActiveFile(newFile)

        if (!sendToSocket) return newFile.id
        socket.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
        return newFile.id
    }, [fileStructure, socket])

    const updateFileContent = useCallback((fileId, newContent, sendToSocket = true) => {
        const update = (directory) => {
            if (directory.type === "file" && directory.id === fileId) {
                return { ...directory, content: newContent }
            } else if (directory.children) {
                return {
                    ...directory,
                    children: directory.children.map(update),
                }
            }
            return directory
        }

        setFileStructure(prev => {
            const updated = update(prev)
            // After updating fileStructure, update openFiles and activeFile from the new structure
            const updatedFile = getFileById(updated, fileId)
            setOpenFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f))
            if (activeFile && activeFile.id === fileId) {
                setActiveFile(updatedFile)
            }
            return updated
        })
        if (sendToSocket) {
            socket.emit(SocketEvent.FILE_UPDATED, { fileId, newContent })
        }
    }, [activeFile, socket])

    const renameFile = useCallback((fileId, newName, sendToSocket = true) => {
        const rename = (directory) => {
            if (directory.type === "directory" && directory.children) {
                return {
                    ...directory,
                    children: directory.children.map((item) =>
                        item.type === "file" && item.id === fileId
                            ? { ...item, name: newName }
                            : item
                    ),
                }
            }
            return directory
        }

        setFileStructure(prev => rename(prev))
        setOpenFiles(prev => prev.map(f => (f.id === fileId ? { ...f, name: newName } : f)))
        if (fileId === activeFile?.id) {
            setActiveFile(prev => (prev ? { ...prev, name: newName } : null))
        }

        if (!sendToSocket) return true
        socket.emit(SocketEvent.FILE_RENAMED, { fileId, newName })
        return true
    }, [activeFile?.id, socket])

    const deleteFile = useCallback((fileId, sendToSocket = true) => {
        const remove = (directory) => {
            if (directory.type === "directory" && directory.children) {
                return {
                    ...directory,
                    children: directory.children.filter(
                        (item) => item.type === "directory" || item.id !== fileId
                    ).map(remove),
                }
            }
            return directory
        }

        setFileStructure(prev => remove(prev))
        setOpenFiles(prev => prev.filter(f => f.id !== fileId))
        if (activeFile?.id === fileId) setActiveFile(null)
        toast.success("File deleted")

        if (!sendToSocket) return
        socket.emit(SocketEvent.FILE_DELETED, { fileId })
    }, [activeFile?.id, socket])

    const downloadFilesAndFolders = () => {
        const zip = new JSZip()
        const recurse = (item, path = "") => {
            const fullPath = path + item.name + (item.type === "directory" ? "/" : "")
            if (item.type === "file") zip.file(fullPath, item.content || "")
            else if (item.children) item.children.forEach(child => recurse(child, fullPath))
        }
        fileStructure.children?.forEach(child => recurse(child))
        zip.generateAsync({ type: "blob" }).then((blob) => saveAs(blob, "download.zip"))
    }

    // --- Real-time sync listeners ---
    useEffect(() => {
        // FILE CREATED
        const handleFileCreated = ({ parentDirId, newFile }) => {
            createFile(parentDirId || fileStructure.id, newFile, false)
        }
        // FILE DELETED
        const handleFileDeleted = ({ fileId }) => {
            deleteFile(fileId, false)
        }
        // FILE RENAMED
        const handleFileRenamed = ({ fileId, newName }) => {
            renameFile(fileId, newName, false)
        }
        // DIRECTORY CREATED
        const handleDirectoryCreated = ({ parentDirId, newDirectory }) => {
            createDirectory(parentDirId, newDirectory, false)
        }
        // DIRECTORY DELETED
        const handleDirectoryDeleted = ({ dirId }) => {
            deleteDirectory(dirId, false)
        }
        // DIRECTORY RENAMED
        const handleDirectoryRenamed = ({ dirId, newName }) => {
            renameDirectory(dirId, newName, false)
        }
        // FILE UPDATED (optional, if you want real-time content sync)
        const handleFileUpdated = ({ fileId, newContent }) => {
            updateFileContent(fileId, newContent, false)
        }
        // DIRECTORY UPDATED (optional)
        const handleDirectoryUpdated = ({ dirId, children }) => {
            updateDirectory(dirId, children, false)
        }
        // SYNC_FILE_STRUCTURE handler
        const handleSyncFileStructure = ({ fileStructure, openFiles, activeFile }) => {
            setFileStructure(fileStructure)
            setOpenFiles(openFiles)
            setActiveFile(activeFile)
        }
        // ACTIVE_FILE_CHANGED handler
        const handleActiveFileChanged = ({ fileId }) => {
            openFile(fileId, false)
        }
        // CLOSE_FILE_TAB handler
        const handleCloseFileTab = ({ fileId }) => {
            closeFile(fileId, false)
        }

        socket.on(SocketEvent.FILE_CREATED, handleFileCreated)
        socket.on(SocketEvent.FILE_DELETED, handleFileDeleted)
        socket.on(SocketEvent.FILE_RENAMED, handleFileRenamed)
        socket.on(SocketEvent.DIRECTORY_CREATED, handleDirectoryCreated)
        socket.on(SocketEvent.DIRECTORY_DELETED, handleDirectoryDeleted)
        socket.on(SocketEvent.DIRECTORY_RENAMED, handleDirectoryRenamed)
        socket.on(SocketEvent.FILE_UPDATED, handleFileUpdated)
        socket.on(SocketEvent.DIRECTORY_UPDATED, handleDirectoryUpdated)
        socket.on(SocketEvent.SYNC_FILE_STRUCTURE, handleSyncFileStructure)
        socket.on(SocketEvent.ACTIVE_FILE_CHANGED, handleActiveFileChanged)
        socket.on(SocketEvent.CLOSE_FILE_TAB, handleCloseFileTab)

        return () => {
            socket.off(SocketEvent.FILE_CREATED, handleFileCreated)
            socket.off(SocketEvent.FILE_DELETED, handleFileDeleted)
            socket.off(SocketEvent.FILE_RENAMED, handleFileRenamed)
            socket.off(SocketEvent.DIRECTORY_CREATED, handleDirectoryCreated)
            socket.off(SocketEvent.DIRECTORY_DELETED, handleDirectoryDeleted)
            socket.off(SocketEvent.DIRECTORY_RENAMED, handleDirectoryRenamed)
            socket.off(SocketEvent.FILE_UPDATED, handleFileUpdated)
            socket.off(SocketEvent.DIRECTORY_UPDATED, handleDirectoryUpdated)
            socket.off(SocketEvent.SYNC_FILE_STRUCTURE, handleSyncFileStructure)
            socket.off(SocketEvent.ACTIVE_FILE_CHANGED, handleActiveFileChanged)
            socket.off(SocketEvent.CLOSE_FILE_TAB, handleCloseFileTab)
        }
    }, [socket, createFile, deleteFile, renameFile, createDirectory, deleteDirectory, renameDirectory, updateFileContent, updateDirectory, openFile, closeFile])

    return (
        <FileContext.Provider value={{
            fileStructure,
            openFiles,
            activeFile,
            setActiveFile,
            closeFile,
            toggleDirectory,
            collapseDirectories,
            createDirectory,
            updateDirectory,
            renameDirectory,
            deleteDirectory,
            openFile,
            createFile,
            updateFileContent,
            renameFile,
            deleteFile,
            downloadFilesAndFolders
        }}>
            {children}
        </FileContext.Provider>
    )
}

export { FileContextProvider }
export default FileContext


