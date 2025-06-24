// Import contexts for managing application state
import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"

// Import custom hooks
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import useResponsive from "@/hooks/useResponsive"

// Import utilities and helper functions
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"

// Import UI components and icons
import { Icon } from "@iconify/react"
import cn from "classnames"
import { useEffect, useRef, useState } from "react"
import { AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { PiPencilSimpleFill } from "react-icons/pi"
import {
    RiFileAddLine,
    RiFolderAddLine,
    RiFolderUploadLine,
} from "react-icons/ri"
import RenameView from "./RenameView"

// Main file explorer component showing the file tree structure
function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } =
        useFileSystem()
    const explorerRef = useRef(null)
    const [selectedDirId, setSelectedDirId] = useState(null)
    const { minHeightReached } = useResponsive()

    // Handle clicking outside the file tree to deselect
    const handleClickOutside = (e) => {
        if (explorerRef.current && !explorerRef.current.contains(e.target)) {
            setSelectedDirId(fileStructure.id)
        }
    }

    // Create a new file in the selected directory
    const handleCreateFile = () => {
        const fileName = prompt("Enter file name")
        if (fileName) {
            const parentDirId = selectedDirId || fileStructure.id
            createFile(parentDirId, fileName)
        }
    }

    // Create a new directory in the selected directory
    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name")
        if (dirName) {
            const parentDirId = selectedDirId || fileStructure.id
            createDirectory(parentDirId, dirName)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div onClick={handleClickOutside} className="flex flex-grow flex-col">
            <div className="view-title flex justify-between">
                <h2>Files</h2>
                <div className="flex gap-2">
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={handleCreateFile}
                        title="Create File"
                    >
                        <RiFileAddLine size={20} />
                    </button>
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={handleCreateDirectory}
                        title="Create Directory"
                    >
                        <RiFolderAddLine size={20} />
                    </button>
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={collapseDirectories}
                        title="Collapse All Directories"
                    >
                        <RiFolderUploadLine size={20} />
                    </button>
                </div>
            </div>
            <div
                className={cn(
                    "min-h-[200px] flex-grow overflow-auto pr-2 sm:min-h-0",
                    {
                        "h-[calc(80vh-170px)]": !minHeightReached,
                        "h-[85vh]": minHeightReached,
                    },
                )}
                ref={explorerRef}
            >
                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
        </div>
    )
}

// Directory component that can contain files and subdirectories
function Directory({ item, setSelectedDirId }) {
    const [isEditing, setEditing] = useState(false)
    const dirRef = useRef(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({ ref: dirRef })
    const { deleteDirectory, toggleDirectory } = useFileSystem()

    // Handle directory click to expand/collapse and select
    const handleDirClick = (dirId) => {
        setSelectedDirId(dirId)
        toggleDirectory(dirId)
    }

    // Handle directory rename from context menu
    const handleRenameDirectory = (e) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    // Handle directory deletion with confirmation
    const handleDeleteDirectory = (e, id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm("Are you sure you want to delete directory?")
        if (isConfirmed) deleteDirectory(id)
    }

    // Set up keyboard shortcuts (F2 for rename)
    useEffect(() => {
        const dirNode = dirRef.current
        if (!dirNode) return
        dirNode.tabIndex = 0

        const handleF2 = (e) => {
            e.stopPropagation()
            if (e.key === "F2") setEditing(true)
        }

        dirNode.addEventListener("keydown", handleF2)
        return () => dirNode.removeEventListener("keydown", handleF2)
    }, [])

    // Render file component if item is a file
    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    return (
        <div className="overflow-x-auto">
            <div
                className="flex w-full items-center rounded-md px-2 py-1 hover:bg-darkHover"
                onClick={() => handleDirClick(item.id)}
                ref={dirRef}
            >
                {item.isOpen ? (
                    <AiOutlineFolderOpen size={24} className="mr-2 min-w-fit" />
                ) : (
                    <AiOutlineFolder size={24} className="mr-2 min-w-fit" />
                )}
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <p className="flex-grow overflow-hidden truncate" title={item.name}>
                        {item.name}
                    </p>
                )}
            </div>
            <div
                className={cn(
                    { hidden: !item.isOpen },
                    { block: item.isOpen },
                    { "pl-4": item.name !== "root" },
                )}
            >
                {item.children &&
                    item.children.map((child) => (
                        <Directory
                            key={child.id}
                            item={child}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>

            {menuOpen && (
                <DirectoryMenu
                    handleDeleteDirectory={handleDeleteDirectory}
                    handleRenameDirectory={handleRenameDirectory}
                    id={item.id}
                    left={coords.x}
                    top={coords.y}
                />
            )}
        </div>
    )
}

// File component for individual files in the file tree
const File = ({ item, setSelectedDirId }) => {
    const { deleteFile, openFile } = useFileSystem()
    const [isEditing, setEditing] = useState(false)
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef(null)
    const { menuOpen, coords, setMenuOpen } = useContextMenu({ ref: fileRef })

    // Handle file click to open in editor
    const handleFileClick = (fileId) => {
        if (isEditing) return
        setSelectedDirId(fileId)
        openFile(fileId)
        if (isMobile) setIsSidebarOpen(false)
        if (activityState === "DRAWING") {
            setActivityState("CODING")
        }
    }

    // Handle file rename from context menu
    const handleRenameFile = (e) => {
        e.stopPropagation()
        setEditing(true)
        setMenuOpen(false)
    }

    // Handle file deletion with confirmation
    const handleDeleteFile = (e, id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm("Are you sure you want to delete file?")
        if (isConfirmed) deleteFile(id)
    }

    // Set up keyboard shortcuts (F2 for rename)
    useEffect(() => {
        const fileNode = fileRef.current
        if (!fileNode) return
        fileNode.tabIndex = 0

        const handleF2 = (e) => {
            e.stopPropagation()
            if (e.key === "F2") setEditing(true)
        }

        fileNode.addEventListener("keydown", handleF2)
        return () => fileNode.removeEventListener("keydown", handleF2)
    }, [])

    return (
        <div
            className="flex w-full items-center rounded-md px-2 py-1 hover:bg-darkHover"
            onClick={() => handleFileClick(item.id)}
            ref={fileRef}
        >
            <Icon
                icon={getIconClassName(item.name)}
                fontSize={22}
                className="mr-2 min-w-fit"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <p className="flex-grow overflow-hidden truncate" title={item.name}>
                    {item.name}
                </p>
            )}

            {menuOpen && (
                <FileMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameFile={handleRenameFile}
                    handleDeleteFile={handleDeleteFile}
                />
            )}
        </div>
    )
}

// Context menu for file operations (rename, delete)
const FileMenu = ({ top, left, id, handleRenameFile, handleDeleteFile }) => (
    <div
        className="absolute z-10 w-[150px] rounded-md border border-darkHover bg-dark p-1"
        style={{ top, left }}
    >
        <button
            onClick={handleRenameFile}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
        >
            <PiPencilSimpleFill size={18} />
            Rename
        </button>
        <button
            onClick={(e) => handleDeleteFile(e, id)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-danger hover:bg-darkHover"
        >
            <MdDelete size={20} />
            Delete
        </button>
    </div>
)

// Context menu for directory operations (rename, delete)
const DirectoryMenu = ({ top, left, id, handleRenameDirectory, handleDeleteDirectory }) => (
    <div
        className="absolute z-10 w-[150px] rounded-md border border-darkHover bg-dark p-1"
        style={{ top, left }}
    >
        <button
            onClick={handleRenameDirectory}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
        >
            <PiPencilSimpleFill size={18} />
            Rename
        </button>
        <button
            onClick={(e) => handleDeleteDirectory(e, id)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-danger hover:bg-darkHover"
        >
            <MdDelete size={20} />
            Delete
        </button>
    </div>
)

export default FileStructureView