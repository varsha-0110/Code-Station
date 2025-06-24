import axiosInstance from "@/api/pistonApi"
import langMap from "lang-map"
import {createContext,useContext,useEffect,useState} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

const RunCodeContext = createContext(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error("useRunCode must be used within a RunCodeContextProvider")
    }
    return context
}

const RunCodeContextProvider = ({ children }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [isRunning, setIsRunning] = useState(false)
    const [supportedLanguages, setSupportedLanguages] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState({
        language: "",
        version: "",
        aliases: []
    })

    useEffect(() => {
        const fetchSupportedLanguages = async () => {
            try {
                const languages = await axiosInstance.get("/runtimes")
                setSupportedLanguages(languages.data)
            } catch (error) {
                toast.error("Failed to fetch supported languages")
                if (error?.response?.data) console.error(error.response.data)
            }
        }

        fetchSupportedLanguages()
    }, [])

    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return

        const extension = activeFile.name.split(".").pop()
        if (extension) {
            const languageName = langMap.languages(extension)
            const language = supportedLanguages.find(
                (lang) =>
                    lang.aliases.includes(extension) ||
                    languageName.includes(lang.language.toLowerCase())
            )
            if (language) setSelectedLanguage(language)
        } else {
            setSelectedLanguage({ language: "", version: "", aliases: [] })
        }
    }, [activeFile?.name, supportedLanguages])

    const runCode = async () => {
        try {
            if (!selectedLanguage.language) {
                return toast.error("Please select a language to run the code")
            }
            if (!activeFile) {
                return toast.error("Please open a file to run the code")
            }

            toast.loading("Running code...")
            setIsRunning(true)

            const { language, version } = selectedLanguage

            const response = await axiosInstance.post("/execute", {
                language,
                version,
                files: [{ name: activeFile.name, content: activeFile.content }],
                stdin: input
            })

            if (response.data.run.stderr) {
                setOutput(response.data.run.stderr)
            } else {
                setOutput(response.data.run.stdout)
            }

            toast.dismiss()
            setIsRunning(false)
        } catch (error) {
            console.error(error?.response?.data || error)
            toast.dismiss()
            toast.error("Failed to run the code")
            setIsRunning(false)
        }
    }

    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext