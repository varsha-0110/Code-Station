import { EditorView, showTooltip } from "@codemirror/view"
import { StateField } from "@codemirror/state"

export function tooltipField(users) {
    return StateField.define({
        create: () => getCursorTooltips(users),
        update(tooltips, tr) {
            if (!tr.docChanged && !tr.selection) return tooltips
            return getCursorTooltips(users)
        },
        provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
    })
}

export function getCursorTooltips(users) {
    return users
        .map((user) => {
            if (!user.typing) return null

            const text = user.username
            const pos = user.cursorPosition

            return {
                pos,
                above: true,
                strictSide: true,
                arrow: true,
                create: () => {
                    const dom = document.createElement("div")
                    dom.className = "cm-tooltip-cursor"
                    dom.textContent = text
                    return { dom }
                },
            }
        })
        .filter(Boolean) // Remove nulls
}

export const cursorTooltipBaseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-cursor": {
        backgroundColor: "#66b",
        color: "white",
        border: "none",
        padding: "2px 7px",
        borderRadius: "4px",
        zIndex: "10",
        "& .cm-tooltip-arrow:before": {
            borderTopColor: "#66b",
        },
        "& .cm-tooltip-arrow:after": {
            borderTopColor: "transparent",
        },
    },
})
export const cursorTooltipTheme = EditorView.theme({
    ".cm-tooltip.cm-tooltip-cursor": {
        backgroundColor: "#66b",
        color: "white",
        border: "none",
        padding: "2px 7px",
        borderRadius: "4px",
        zIndex: "10",
    },
    ".cm-tooltip-arrow": {
        borderTopColor: "#66b",
    },
})