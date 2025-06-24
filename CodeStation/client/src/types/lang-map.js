// Import the module
import langMap from "lang-map"

// Get languages for an extension
const languages = langMap.languages("js")
console.log(languages) // e.g., ["JavaScript"]

// Get extensions for a language
const extensions = langMap.extensions("JavaScript")
console.log(extensions) // e.g., ["js", "mjs"]

