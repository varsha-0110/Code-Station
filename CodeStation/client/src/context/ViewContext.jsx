import { createContext, useContext, useState, useEffect } from "react"

import ChatsView from "@/components/sidebar/sidebar-views/ChatsView"
// import CopilotView from "@/components/sidebar/sidebar-views/CopilotView"
import FilesView from "@/components/sidebar/sidebar-views/FilesView"
import RunView from "@/components/sidebar/sidebar-views/RunView"
import SettingsView from "@/components/sidebar/sidebar-views/SettingsView"
import UsersView from "@/components/sidebar/sidebar-views/UsersView"
import useWindowDimensions from "@/hooks/useWindowDimensions"

import { IoSettingsOutline } from "react-icons/io5"
import { LuFiles, LuSparkles } from "react-icons/lu"
import { PiChats, PiPlay, PiUsers } from "react-icons/pi"

// View identifiers (replace with enum-like object if not importing)
export const VIEWS = {
    FILES: "FILES",
    CLIENTS: "CLIENTS",
    SETTINGS: "SETTINGS",
    COPILOT: "COPILOT",
    CHATS: "CHATS",
    RUN: "RUN",
}

const ViewContext = createContext(null)

export const useViews = () => {
    const context = useContext(ViewContext)
    if (!context) {
        throw new Error("useViews must be used within a ViewContextProvider")
    }
    return context
}

const ViewContextProvider = ({ children }) => {
    const { isMobile } = useWindowDimensions()

    // Load from localStorage if available
    const getInitialView = () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("sidebarActiveView")
            if (stored && Object.values(VIEWS).includes(stored)) {
                return stored
            }
        }
        return VIEWS.FILES
    }

    const [activeView, setActiveViewState] = useState(getInitialView)
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)

    // Wrap setActiveView to persist to localStorage
    const setActiveView = (view) => {
        setActiveViewState(view)
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebarActiveView", view)
        }
    }

    useEffect(() => {
        // On mount, ensure the view is set from localStorage
        const stored = localStorage.getItem("sidebarActiveView")
        if (stored && Object.values(VIEWS).includes(stored)) {
            setActiveViewState(stored)
        }
    }, [])

    const [viewComponents] = useState({
        [VIEWS.FILES]: <FilesView />,
        [VIEWS.CLIENTS]: <UsersView />,
        [VIEWS.SETTINGS]: <SettingsView />,
        // [VIEWS.COPILOT]: <CopilotView />,
        [VIEWS.CHATS]: <ChatsView />,
        [VIEWS.RUN]: <RunView />,
    })

    const [viewIcons] = useState({
        [VIEWS.FILES]: <LuFiles size={28} />,
        [VIEWS.CLIENTS]: <PiUsers size={30} />,
        [VIEWS.SETTINGS]: <IoSettingsOutline size={28} />,
        // [VIEWS.COPILOT]: <LuSparkles size={28} />,
        [VIEWS.CHATS]: <PiChats size={30} />,
        [VIEWS.RUN]: <PiPlay size={28} />,
    })

    return (
        <ViewContext.Provider
            value={{
                activeView,
                setActiveView,
                isSidebarOpen,
                setIsSidebarOpen,
                viewComponents,
                viewIcons,
            }}
        >
            {children}
        </ViewContext.Provider>
    )
}

export { ViewContextProvider }
export default ViewContext

