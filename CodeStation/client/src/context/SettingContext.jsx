import useLocalStorage from "@/hooks/useLocalStorage"
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react"

const SettingContext = createContext(null)

export const useSettings = () => {
    const context = useContext(SettingContext)
    if (!context) {
        throw new Error("useSettings must be used within a SettingContextProvider")
    }
    return context
}

const defaultSettings = {
    theme: "Dracula",
    language: "Cpp",
    fontSize: 16,
    fontFamily: "Space Mono",
}

function SettingContextProvider({ children }) {
    const { getItem } = useLocalStorage()
    const storedSettings = JSON.parse(getItem("settings") || "{}")

    const storedTheme =
        storedSettings.theme !== undefined
            ? storedSettings.theme
            : defaultSettings.theme
    const storedLanguage =
        storedSettings.language !== undefined
            ? storedSettings.language
            : defaultSettings.language
    const storedFontSize =
        storedSettings.fontSize !== undefined
            ? storedSettings.fontSize
            : defaultSettings.fontSize
    const storedFontFamily =
        storedSettings.fontFamily !== undefined
            ? storedSettings.fontFamily
            : defaultSettings.fontFamily

    const [theme, setTheme] = useState(storedTheme)
    const [language, setLanguage] = useState(storedLanguage)
    const [fontSize, setFontSize] = useState(storedFontSize)
    const [fontFamily, setFontFamily] = useState(storedFontFamily)

    const resetSettings = () => {
        setTheme(defaultSettings.theme)
        setLanguage(defaultSettings.language)
        setFontSize(defaultSettings.fontSize)
        setFontFamily(defaultSettings.fontFamily)
    }

    useEffect(() => {
        const updatedSettings = {
            theme,
            language,
            fontSize,
            fontFamily,
        }
        localStorage.setItem("settings", JSON.stringify(updatedSettings))
    }, [theme, language, fontSize, fontFamily])

    return (
        <SettingContext.Provider
            value={{
                theme,
                setTheme,
                language,
                setLanguage,
                fontSize,
                setFontSize,
                fontFamily,
                setFontFamily,
                resetSettings
            }}
        >
            {children}
        </SettingContext.Provider>
    )
}

export { SettingContextProvider }
export default SettingContext
