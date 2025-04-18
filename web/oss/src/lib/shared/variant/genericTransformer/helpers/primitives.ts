import type {
    PrimitiveSchema,
    SchemaProperty,
    ConfigMetadata,
    StringMetadata,
    NumberMetadata,
    BooleanMetadata,
} from "../types"

import {createBaseMetadata} from "./metadata"
import {isSchema} from "./schema"
import {extractSchema} from "./schemaExtractors"

/**
 * Create primitive metadata with type checking.
 * @param schema - The schema to create metadata from.
 * @returns A ConfigMetadata object containing the metadata.
 */
export function createPrimitiveMetadata(schema: PrimitiveSchema | SchemaProperty): ConfigMetadata {
    const {schema: extractedSchema, isNullable} = extractSchema(schema)

    if (!isSchema.primitive(extractedSchema)) {
        throw new Error("Expected primitive schema")
    }

    // Determine type and integer flag early
    const isInteger = extractedSchema.type === "integer"
    const type = isInteger ? "number" : extractedSchema.type

    const baseMetadata = {
        ...createBaseMetadata(extractedSchema),
        type,
        nullable: isNullable,
        ...(type === "number" && {
            min:
                extractedSchema.minimum ??
                (extractedSchema.exclusiveMinimum
                    ? extractedSchema.exclusiveMinimum + (isInteger ? 1 : 0.1)
                    : undefined),
            max:
                extractedSchema.maximum ??
                (extractedSchema.exclusiveMaximum
                    ? extractedSchema.exclusiveMaximum - (isInteger ? 1 : 0.1)
                    : undefined),
            isInteger, // Add isInteger flag for both integer and number types
        }),
    }

    // Return appropriate metadata based on type
    switch (type) {
        case "string":
            return {
                ...baseMetadata,
                allowFreeform: !baseMetadata.options && !("const" in extractedSchema),
            } as StringMetadata

        case "number":
            return baseMetadata as NumberMetadata

        case "boolean":
            return baseMetadata as BooleanMetadata

        default:
            throw new Error(`Unsupported primitive type: ${extractedSchema.type}`)
    }
}
