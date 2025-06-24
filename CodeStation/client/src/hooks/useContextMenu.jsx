import { useEffect, useState } from "react"

export const useContextMenu = ({ ref }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [coords, setCoords] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const itemRef = ref.current
        if (!itemRef) return

        const closeMenu = () => {
            setMenuOpen(false)
        }

        const handleRightClick = (e) => {
            if (ref.current && ref.current.contains(e.target)) {
                setMenuOpen(true)
                setCoords({ x: e.pageX, y: e.pageY })
            } else {
                setMenuOpen(false)
            }
        }

        const handleItemContextMenu = (e) => {
            e.preventDefault()
            setMenuOpen(true)
            setCoords({ x: e.pageX, y: e.pageY })
        }

        itemRef.addEventListener("contextmenu", handleItemContextMenu)
        document.addEventListener("click", closeMenu)
        document.addEventListener("contextmenu", handleRightClick)

        return () => {
            itemRef.removeEventListener("contextmenu", handleItemContextMenu)
            document.removeEventListener("click", closeMenu)
            document.removeEventListener("contextmenu", handleRightClick)
        }
    }, [ref])

    return {
        menuOpen,
        setMenuOpen,
        coords,
        setCoords,
    }
}

