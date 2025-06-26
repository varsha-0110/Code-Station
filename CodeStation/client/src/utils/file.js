import { v4 as uuidv4 } from "uuid"

// Sample initial code
const initialCode = `function sayHi() {
  console.log("👋 Hello world");
}

sayHi()`;

// Initial file structure object
export const initialFileStructure = {
  name: "root",
  id: "root",
  type: "directory",
  children: [
    // No default files
  ],
};

// Find a parent directory recursively
export const findParentDirectory = (directory, parentDirId) => {
  if (directory.id === parentDirId && directory.type === "directory") {
    return directory;
  }

  if (directory.type === "directory" && directory.children) {
    for (const child of directory.children) {
      const found = findParentDirectory(child, parentDirId);
      if (found) return found;
    }
  }

  return null;
};

// Check if a file exists in the directory
export const isFileExist = (parentDir, name) => {
  if (!parentDir.children) return false;
  return parentDir.children.some((file) => file.name === name);
};

// Find a file by ID recursively
export const getFileById = (fileStructure, fileId) => {
  const findFile = (directory) => {
    if (directory.id === fileId) {
      return directory;
    } else if (directory.children) {
      for (const child of directory.children) {
        const found = findFile(child);
        if (found) return found;
      }
    }
    return null;
  };

  return findFile(fileStructure);
};

// Sort directories and files (dot-prefixed first, A-Z)
export const sortFileSystemItem = (item) => {
  if (item.type === "directory" && item.children) {
    let directories = item.children.filter((child) => child.type === "directory");
    const files = item.children.filter((child) => child.type === "file");

    directories.sort((a, b) => a.name.localeCompare(b.name));
    directories = directories.map((dir) => sortFileSystemItem(dir));

    files.sort((a, b) => a.name.localeCompare(b.name));

    item.children = [
      ...directories.filter((dir) => dir.name.startsWith(".")),
      ...directories.filter((dir) => !dir.name.startsWith(".")),
      ...files.filter((file) => file.name.startsWith(".")),
      ...files.filter((file) => !file.name.startsWith(".")),
    ];
  }

  return item;
};

