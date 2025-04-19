import {useCallback} from "react"

import clsx from "clsx"

import usePlayground from "../../hooks/usePlayground"
import {findPropertyInObject} from "../../hooks/usePlayground/assets/helpers"
import type {PlaygroundStateData} from "../../hooks/usePlayground/types"
import {GenerationChatRow} from "../../state/types"

import GenerationComparisonChatOutput from "./GenerationComparisonChatOutput"
import GenerationComparisonCompletionOutput from "./GenerationComparisonCompletionOutput"

const GenerationComparisonOutput = ({rowId, isLastRow}: {rowId: string; isLastRow?: boolean}) => {
    const {isChat, displayedVariants, chatHistory} = usePlayground({
        stateSelector: useCallback(
            (state: PlaygroundStateData) => {
                const chatRow = findPropertyInObject(state, rowId) as GenerationChatRow
                const chatHistory = chatRow?.history?.value?.map((item) => item.__id)
                return {isChat: state.variants[0]?.isChat, chatHistory}
            },
            [rowId],
        ),
    })

    return (
        <div className={clsx([{flex: !isChat}])}>
            {isChat
                ? (chatHistory || []).map((chatId, historyIndex) => (
                      <GenerationComparisonChatOutput
                          key={chatId}
                          historyId={chatId}
                          rowId={rowId}
                          isLastRow={historyIndex === chatHistory.length - 1}
                          isFirstRow={historyIndex === 0}
                      />
                  ))
                : displayedVariants?.map((variantId, variantIndex) => (
                      <GenerationComparisonCompletionOutput
                          key={`${variantId}-${rowId}`}
                          rowId={rowId}
                          variantId={variantId}
                          variantIndex={variantIndex}
                          isLastRow={isLastRow}
                          isLastVariant={variantIndex === (displayedVariants || []).length - 1}
                      />
                  ))}
        </div>
    )
}

export {GenerationComparisonOutput}
