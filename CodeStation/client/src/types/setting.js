/**
 * @typedef {Object} Settings
 * @property {string} theme - Current theme (e.g., 'Dracula')
 * @property {string} language - Programming language (e.g., 'JavaScript')
 * @property {number} fontSize - Font size for editor
 * @property {string} fontFamily - Font family name
 * @property {boolean} showGitHubCorner - Whether to display the GitHub corner UI
 */

/**
 * @typedef {Settings & {
 *   setTheme: (theme: string) => void,
 *   setLanguage: (language: string) => void,
 *   setFontSize: (fontSize: number) => void,
 *   setFontFamily: (fontFamily: string) => void,
 *   setShowGitHubCorner: (show: boolean) => void,
 *   resetSettings: () => void
 * }} SettingsContext
 */

export {}
