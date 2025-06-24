
import { useState } from "react"
import FileStructureView from "@/components/files/FileStructureView"
import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import cn from "classnames"
import { BiArchiveIn } from "react-icons/bi"
import { TbFileUpload } from "react-icons/tb"
import { v4 as uuidV4 } from "uuid"
import { toast } from "react-hot-toast"

function FilesView() {
    const { downloadFilesAndFolders, updateDirectory, fileTree } = useFileSystem()
    const { viewHeight, minHeightReached } = useResponsive()
    const [isLoading, setIsLoading] = useState(false)

    const handleOpenDirectory = async () => {
        try {
            if (fileTree?.length > 0) {
                const confirmReplace = confirm("Replace current directory structure?");
                if (!confirmReplace) return
            }

            setIsLoading(true)

            // Modern browser support
            if ("showDirectoryPicker" in window) {
                const directoryHandle = await window.showDirectoryPicker()
                await processDirectoryHandle(directoryHandle)
                return
            }

            // Fallback
            if ("webkitdirectory" in HTMLInputElement.prototype) {
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                fileInput.webkitdirectory = true

                fileInput.onchange = async (e) => {
                    const files = e.target.files
                    if (files) {
                        const structure = await readFileList(files)
                        updateDirectory("", structure)
                        toast.success(`Loaded ${files.length} files`)
                    }
                }

                fileInput.click()
                return
            }

            toast.error("Your browser does not support directory selection.")
        } catch (error) {
            console.error("Error opening directory:", error)
            toast.error("Failed to open directory")
        } finally {
            setIsLoading(false)
        }
    }

    const processDirectoryHandle = async (directoryHandle) => {
        try {
            toast.loading("Getting files and folders...")
            const structure = await readDirectory(directoryHandle)
            updateDirectory("", structure)
            toast.dismiss()
            toast.success("Directory loaded successfully")
        } catch (error) {
            console.error("Error processing directory:", error)
            toast.error("Failed to process directory")
        }
    }

    const readDirectory = async (directoryHandle) => {
        const children = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for await (const entry of directoryHandle.values()) {
            if (entry.kind === "file") {
                const file = await entry.getFile()
                const content = await readFileContent(file)
                children.push({
                    id: uuidV4(),
                    name: entry.name,
                    type: "file",
                    content,
                })
            } else if (entry.kind === "directory" && !blackList.includes(entry.name)) {
                children.push({
                    id: uuidV4(),
                    name: entry.name,
                    type: "directory",
                    children: await readDirectory(entry),
                    isOpen: false,
                })
            }
        }

        return children
    }

    const readFileList = async (files) => {
        const children = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        const insertNested = (tree, pathParts, file) => {
            const [current, ...rest] = pathParts

            let dir = tree.find(
                (item) => item.name === current && item.type === "directory"
            )

            if (!dir) {
                dir = {
                    id: uuidV4(),
                    name: current,
                    type: "directory",
                    children: [],
                    isOpen: false,
                }
                tree.push(dir)
            }

            if (rest.length === 0) {
                dir.children.push(file)
            } else {
                insertNested(dir.children, rest, file)
            }
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const pathParts = file.webkitRelativePath.split("/")
            if (pathParts.some((p) => blackList.includes(p))) continue

            const content = await readFileContent(file)
            const fileItem = {
                id: uuidV4(),
                name: file.name,
                type: "file",
                content,
            }

            if (pathParts.length > 1) {
                insertNested(children, pathParts.slice(0, -1), fileItem)
            } else {
                children.push(fileItem)
            }
        }

        return children
    }

    const readFileContent = async (file) => {
        const MAX_FILE_SIZE = 1024 * 1024 // 1MB

        if (file.size > MAX_FILE_SIZE) {
            return `// ${file.name} is too large to read (${Math.round(file.size / 1024)}KB)`
        }

        try {
            return await file.text()
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error)
            return `// Error reading file: ${file.name}`
        }
    }

    return (
        <div
            className="flex select-none flex-col gap-1 px-4 py-2"
            style={{ height: viewHeight, maxHeight: viewHeight }}
        >
            <FileStructureView />
            <div
                className={cn(`flex min-h-fit flex-col justify-end pt-2`, {
                    hidden: minHeightReached,
                })}
            >
                <hr />
                <button
                    className="mt-2 flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                    onClick={handleOpenDirectory}
                    disabled={isLoading}
                >
                    <TbFileUpload className="mr-2" size={24} />
                    {isLoading ? "Loading..." : "Open File/Folder"}
                </button>
                <button
                    className="flex w-full justify-start rounded-md p-2 transition-all hover:bg-darkHover"
                    onClick={downloadFilesAndFolders}
                >
                    <BiArchiveIn className="mr-2" size={22} /> Download Code
                </button>
            </div>
        </div>
    )
}

export default FilesView
