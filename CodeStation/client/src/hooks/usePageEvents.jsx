import { useSettings } from "@/context/SettingContext"
import { useEffect } from "react"

function usePageEvents() {
    const { fontSize, setFontSize } = useSettings()

    useEffect(() => {
        const beforeUnloadHandler = (e) => {
            const msg = "Changes you made may not be saved"
            e.returnValue = msg
            return msg
        }

        window.addEventListener("beforeunload", beforeUnloadHandler)

        return () => {
            window.removeEventListener("beforeunload", beforeUnloadHandler)
        }
    }, [])

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault()
                if (!e.target.closest(".cm-editor")) return
                if (e.deltaY > 0) {
                    setFontSize(Math.max(fontSize - 1, 12))
                } else {
                    setFontSize(Math.min(fontSize + 1, 24))
                }
            }
        }

        window.addEventListener("wheel", handleWheel, { passive: false })

        return () => {
            window.removeEventListener("wheel", handleWheel)
        }
    }, [fontSize, setFontSize])
}

export default usePageEvents
