import {useCallback, useMemo} from "react"

import {MoreOutlined} from "@ant-design/icons"
import {ArrowCounterClockwise, Copy, PencilSimple, Trash} from "@phosphor-icons/react"
import {Button, Dropdown, MenuProps} from "antd"

import usePlayground from "@/oss/components/NewPlayground/hooks/usePlayground"
import {PlaygroundStateData} from "@/oss/components/NewPlayground/hooks/usePlayground/types"

import DeleteVariantButton from "../../Modals/DeleteVariantModal/assets/DeleteVariantButton"

import {PlaygroundVariantHeaderMenuProps} from "./types"

const PlaygroundVariantHeaderMenu: React.FC<PlaygroundVariantHeaderMenuProps> = ({
    variantId,
    ...props
}) => {
    const {mutate, closePanelDisabled} = usePlayground({
        stateSelector: useCallback(
            (state: PlaygroundStateData) => {
                return {
                    closePanelDisabled:
                        state.selected.length === 1 && state.selected.includes(variantId),
                }
            },
            [variantId],
        ),
    })

    const handleClosePanel = useCallback(() => {
        mutate((clonedState) => {
            if (!clonedState) return clonedState
            const previousSelected = [...clonedState.selected]
            previousSelected.splice(
                previousSelected.findIndex((id) => id === variantId),
                1,
            )

            clonedState.selected = previousSelected
            return clonedState
        })
    }, [variantId])

    const items: MenuProps["items"] = useMemo(
        () => [
            {
                key: "history",
                label: "History",
                icon: <ArrowCounterClockwise size={14} />,
                disabled: true,
                onClick: (e) => {
                    e.domEvent.stopPropagation()
                },
            },
            {
                key: "rename",
                label: "Rename",
                icon: <PencilSimple size={16} />,
                disabled: true,
                onClick: (e) => {
                    e.domEvent.stopPropagation()
                },
            },
            {type: "divider"},
            {
                key: "clone",
                label: "Clone",
                icon: <Copy size={16} />,
                disabled: true,
                onClick: (e) => {
                    e.domEvent.stopPropagation()
                },
            },
            {
                key: "delete",
                danger: true,
                label: (
                    <DeleteVariantButton variantId={variantId}>
                        <div className="w-full h-full">Delete</div>
                    </DeleteVariantButton>
                ),
                icon: <Trash size={16} />,
            },
            {type: "divider"},
            {
                key: "reset",
                label: "Reset",
                disabled: true,
                onClick: (e) => {
                    e.domEvent.stopPropagation()
                },
            },
            {
                key: "close",
                label: "Close panel",
                disabled: closePanelDisabled,
                onClick: (e) => {
                    e.domEvent.stopPropagation()
                    handleClosePanel()
                },
            },
        ],
        [handleClosePanel, closePanelDisabled, variantId],
    )

    return (
        <Dropdown trigger={["click"]} overlayStyle={{width: 170}} menu={{items}} {...props}>
            <Button icon={<MoreOutlined size={14} />} type="text" />
        </Dropdown>
    )
}

export default PlaygroundVariantHeaderMenu
