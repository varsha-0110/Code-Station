import { useAppContext } from "@/context/AppContext";
import { useFileSystem } from "@/context/FileContext";
import { useSettings } from "@/context/SettingContext";
import { useSocket } from "@/context/SocketContext";
import usePageEvents from "@/hooks/usePageEvents";
import useResponsive from "@/hooks/useResponsive";
import { editorThemes } from "@/resources/Themes";
import { color } from "@uiw/codemirror-extensions-color";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { scrollPastEnd } from "@codemirror/view";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip";

function Editor() {
    const { users, currentUser } = useAppContext();
    const { activeFile, updateFileContent } = useFileSystem();
    const { theme, language, fontSize } = useSettings();
    const { socket } = useSocket();
    const { viewHeight } = useResponsive();

    const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0));
    const filteredUsers = useMemo(() => {
        return users.filter((u) => u.username !== currentUser.username);
    }, [users, currentUser]);

    const [extensions, setExtensions] = useState([]);

    const onCodeChange = (code, view) => {
        if (!activeFile) return;
        updateFileContent(activeFile.id, code, true);

        const cursorPosition = view.state?.selection?.main?.head;
        socket.emit(SocketEvent.TYPING_START, { cursorPosition });

        clearTimeout(timeOut);
        const newTimeOut = setTimeout(() => {
            socket.emit(SocketEvent.TYPING_PAUSE);
        }, 1000);
        setTimeOut(newTimeOut);
    };

    usePageEvents();

    useEffect(() => {
        const ext = [
            color,
            hyperLink,
            tooltipField(filteredUsers),
            cursorTooltipBaseTheme,
            scrollPastEnd(),
        ];

        const langExt = loadLanguage(language.toLowerCase());
        if (langExt) {
            ext.push(langExt);
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                { duration: 5000 }
            );
        }

        setExtensions(ext);
    }, [filteredUsers, language]);

    return (
        <CodeMirror
            key={activeFile?.id}
            theme={editorThemes[theme]}
            onChange={onCodeChange}
            value={activeFile?.content || ""}
            extensions={extensions}
            minHeight="100%"
            maxWidth="100vw"
            style={{
                fontSize: fontSize + "px",
                height: viewHeight,
                position: "relative",
            }}
        />
    );
}

export default Editor;

