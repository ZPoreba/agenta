import {cloneElement, isValidElement, useEffect, useMemo, useState} from "react"

import {TreeView} from "@phosphor-icons/react"
import {Button} from "antd"
import clsx from "clsx"
import dynamic from "next/dynamic"

import {
    buildNodeTree,
    getNodeById,
    observabilityTransformer,
} from "@/oss/lib/helpers/observability_helpers"
import {_AgentaRootsResponse, AgentaNodeDTO} from "@/oss/services/observability/types"

import {TraceDrawerButtonProps} from "./types"

const GenericDrawer = dynamic(() => import("@/oss/components/GenericDrawer"))
const TraceContent = dynamic(
    () => import("@/oss/components/pages/observability/drawer/TraceContent"),
)
const TraceHeader = dynamic(() => import("@/oss/components/pages/observability/drawer/TraceHeader"))
const TraceTree = dynamic(() => import("@/oss/components/pages/observability/drawer/TraceTree"))

const TraceDrawerButton = ({
    label,
    icon = true,
    children,
    result,
    ...props
}: TraceDrawerButtonProps) => {
    const [selected, setSelected] = useState("")
    const [isTraceDrawerOpen, setIsTraceDrawerOpen] = useState(false)
    const traceSpans = result?.response?.tree

    const traces = useMemo(() => {
        if (traceSpans && traceSpans) {
            return traceSpans.nodes
                .flatMap((node) => buildNodeTree(node as AgentaNodeDTO))
                .flatMap((item: any) => observabilityTransformer(item))
        }
    }, [traceSpans])

    const activeTrace = useMemo(
        () =>
            traces
                ? traces[0] ?? null
                : result?.error
                  ? ({
                        exception: result?.metadata?.rawError,
                        node: {name: "Exception"},
                        status: {code: "ERROR"},
                    } as _AgentaRootsResponse)
                  : null,
        [traces],
    )

    useEffect(() => {
        if (!selected) {
            setSelected(activeTrace?.node.id ?? "")
        }
    }, [activeTrace, selected])

    const selectedItem = useMemo(
        () => (traces?.length ? getNodeById(traces, selected) : null),
        [selected, traces],
    )
    return (
        <>
            {isValidElement(children) ? (
                cloneElement(
                    children as React.ReactElement<{
                        onClick: () => void
                    }>,
                    {
                        onClick: () => {
                            setIsTraceDrawerOpen(true)
                        },
                    },
                )
            ) : (
                <Button
                    type="text"
                    icon={icon && <TreeView size={14} />}
                    onClick={() => setIsTraceDrawerOpen(true)}
                    {...props}
                    disabled={!activeTrace}
                    className={clsx([props.className])}
                >
                    {label}
                </Button>
            )}

            {isTraceDrawerOpen && (
                <GenericDrawer
                    open={isTraceDrawerOpen}
                    onClose={() => setIsTraceDrawerOpen(false)}
                    expandable
                    headerExtra={
                        !!activeTrace && !!traces ? (
                            <TraceHeader
                                activeTrace={activeTrace as _AgentaRootsResponse}
                                traces={(traces as _AgentaRootsResponse[]) || []}
                                setSelectedTraceId={() => setIsTraceDrawerOpen(false)}
                                activeTraceIndex={0}
                            />
                        ) : null
                    }
                    mainContent={
                        activeTrace ? (
                            <TraceContent
                                activeTrace={selectedItem || (activeTrace as _AgentaRootsResponse)}
                            />
                        ) : null
                    }
                    sideContent={
                        activeTrace ? (
                            <TraceTree
                                activeTrace={activeTrace as _AgentaRootsResponse}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        ) : null
                    }
                />
            )}
        </>
    )
}

export default TraceDrawerButton
