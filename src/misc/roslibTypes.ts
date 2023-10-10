export const CATEGORIES = [
    'bools',
    'ints',
    'strs',
    'doubles',
    'groups',
] as const

export type DynamicReconfigureCategories = (typeof CATEGORIES)[number]

export interface DynamicReconfigureParameter {
    name: string
    value: boolean | number | string | any
}

export type DynamicReconfigureMessage = {
    [key in DynamicReconfigureCategories]: DynamicReconfigureParameter[]
}

export type DynamicReconfigureEmptyConfig = {
    config: {}
}

export type DynamicReconfigureConfig = {
    config: DynamicReconfigureMessage
}

export type DynamicReconfigureValues = Record<string, string>
export type DynamicReconfigureDataTypes = Record<
    string,
    DynamicReconfigureCategories
>
