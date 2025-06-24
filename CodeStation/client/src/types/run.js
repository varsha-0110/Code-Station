/**
 * @typedef {Object} Language
 * @property {string} language - Name of the programming language
 * @property {string} version - Version of the language
 * @property {string[]} aliases - Supported file extensions or aliases
 */

/**
 * @typedef {Object} RunContext
 * @property {(input: string) => void} setInput - Set input to be passed to stdin
 * @property {string} output - Output or error from the code execution
 * @property {boolean} isRunning - Indicates if code is currently running
 * @property {Language[]} supportedLanguages - List of all supported languages
 * @property {Language} selectedLanguage - Currently selected language to run
 * @property {(language: Language) => void} setSelectedLanguage - Change selected language
 * @property {() => void} runCode - Trigger code execution
 */

export {}

