import { useEffect } from "react";
import Select from "@/components/common/Select";
import { useSettings } from "@/context/SettingContext";
import useResponsive from "@/hooks/useResponsive";
import { editorFonts } from "@/resources/Fonts";
import { editorThemes } from "@/resources/Themes";
import { langNames } from "@uiw/codemirror-extensions-langs";

function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    } = useSettings();

    const { viewHeight } = useResponsive();

    const handleFontFamilyChange = (e) => setFontFamily(e.target.value);
    const handleThemeChange = (e) => setTheme(e.target.value);
    const handleLanguageChange = (e) => setLanguage(e.target.value);
    const handleFontSizeChange = (e) => setFontSize(parseInt(e.target.value));

    useEffect(() => {
        const editor = document.querySelector(".cm-editor > .cm-scroller");
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`;
        }
    }, [fontFamily]);

    return (
        <div
            className="flex flex-col items-center gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Settings</h1>

            {/* Font Family and Size */}
            <div className="flex w-full items-end gap-2">
                <Select
                    onChange={handleFontFamilyChange}
                    value={fontFamily}
                    options={editorFonts}
                    title="Font Family"
                />
                <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="rounded-md border-2 border-blue-400 bg-gray-900 px-4 py-2 text-white outline-none"
                    title="Font Size"
                >
                    {[...Array(13).keys()].map((size) => (
                        <option key={size} value={size + 12}>
                            {size + 12}
                        </option>
                    ))}
                </select>
            </div>

            {/* Theme Selector */}
            <Select
                onChange={handleThemeChange}
                value={theme}
                options={Object.keys(editorThemes)}
                title="Theme"
            />

            {/* Language Selector */}
            <Select
                onChange={handleLanguageChange}
                value={language}
                options={langNames}
                title="Language"
            />

            <button
                onClick={resetSettings}
                className="mt-4 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
                Reset Settings
            </button>
        </div>
    );
}

export default SettingsView;

