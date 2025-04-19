import {getAllMetadata, getMetadataLazy} from "@/oss/lib/hooks/useStatelessVariants/state"
import {MessageWithRuns} from "@/oss/lib/hooks/useStatelessVariants/state/types"
import {generateId} from "@/oss/lib/shared/variant/stringUtils"
import {checkValidity, extractValueByMetadata} from "@/oss/lib/shared/variant/valueHelpers"

import {isObjectMetadata} from "../../../../../lib/shared/variant/genericTransformer/helpers/metadata"
import type {
    ConfigMetadata,
    Enhanced,
    ObjectMetadata,
} from "../../../../../lib/shared/variant/genericTransformer/types"
import {Message} from "../../../../../lib/shared/variant/transformer/types"
import {hashMetadata} from "../../../assets/hash"
import {PlaygroundStateData} from "../types"

export const createMessageFromSchema = (
    metadata: ConfigMetadata,
    json?: Record<string, unknown>,
): Enhanced<MessageWithRuns> | undefined => {
    const properties: Record<string, any> = {}

    if (isObjectMetadata(metadata)) {
        Object.entries(metadata.properties).forEach(([key, propMetadata]) => {
            const metadataHash = hashMetadata(propMetadata)

            // Initialize with default values based on property type
            let defaultValue: any = null
            if (key === "role") {
                defaultValue = ""
                // "user" // Default role
            } else if (key === "content") {
                defaultValue = "" // Empty content
            }

            properties[key] = {
                __id: generateId(),
                __metadata: metadataHash,
                value: json?.[key] || defaultValue,
            }
        })
        const metadataHash = hashMetadata(metadata)

        return {
            __id: generateId(),
            __metadata: metadataHash,
            ...properties,
        } as Enhanced<MessageWithRuns>
    } else {
        return undefined
    }
}

export const createMessageRow = (
    message: Enhanced<Message>,
    metadata: ObjectMetadata,
    messagesMetadata: string,
) => {
    const metadataHash = hashMetadata(metadata)
    const arrayMetadata = getMetadataLazy(messagesMetadata)

    return {
        __id: generateId(),
        __metadata: metadataHash,
        history: {
            value: [message],
            __id: generateId(),
            __metadata: hashMetadata(arrayMetadata),
        },
    }
}

export const constructChatHistory = ({
    messageRow,
    messageId,
    variantId,
    includeLastMessage = false,
}: {
    messageRow?: PlaygroundStateData["generationData"]["messages"]["value"][number]
    messageId: string
    variantId: string
    includeLastMessage?: boolean
}) => {
    let constructedHistory = []
    const allMetadata = getAllMetadata()

    if (messageRow) {
        for (const historyItem of messageRow.history.value) {
            let userMessage = extractValueByMetadata(historyItem, allMetadata)
            const messageMetadata = getMetadataLazy<ObjectMetadata>(
                historyItem.__metadata as string,
            )

            if (messageMetadata) {
                userMessage = checkValidity(historyItem, messageMetadata) ? userMessage : undefined

                if (historyItem.__id === messageId) {
                    if (includeLastMessage) {
                        constructedHistory.push(userMessage)
                    }
                    break
                }

                constructedHistory.push(userMessage)

                const variantResponse = historyItem.__runs?.[variantId]?.message
                if (variantResponse?.__id === messageId) {
                    break
                }
                let llmResponse = extractValueByMetadata(variantResponse, allMetadata)

                if (variantResponse) {
                    llmResponse = checkValidity(variantResponse, messageMetadata)
                        ? llmResponse
                        : undefined

                    constructedHistory.push(llmResponse)
                }
            }
        }
    }

    constructedHistory = constructedHistory.filter(Boolean)

    return constructedHistory
}
