import {ButtonProps} from "antd"

export interface DeployVariantButtonProps extends ButtonProps {
    variantId?: string
    revisionId?: string
    label?: React.ReactNode
    icon?: boolean
    children?: React.ReactNode
}
