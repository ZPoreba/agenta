import {type CollapseProps} from "antd"

import {EnhancedVariant} from "../../../../lib/shared/variant/transformer/types"
import {BaseContainerProps} from "../types"

export interface PlaygroundVariantConfigPromptComponentProps extends CollapseProps {
    /** Unique identifier for the variant being configured */
    variantId: string
    /** Unique identifier for the prompt being configured */
    promptId: string
}

/**
 * Props for the collapse content component that manages prompt message configurations
 */
export interface PromptCollapseContentProps extends BaseContainerProps {
    /** ID of the variant being configured */
    variantId: EnhancedVariant["id"]
    promptId: string
}

/**
 * Props for the prompt configuration collapse header component
 */
export interface PromptCollapseHeaderProps extends BaseContainerProps {
    /** ID of the variant being configured */
    variantId: string
    /** ID of the prompt being configured */
    promptId: string
}
