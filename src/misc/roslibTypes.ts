export const CATEGORIES = [
    'bools',
    'ints',
    'strs',
    'doubles',
    'groups',
] as const

export type DynamicReconfigureCategories = (typeof CATEGORIES)[number]

export interface IDynamicReconfigureParameter {
    name: string
    value: boolean | number | string | any
}

export type DynamicReconfigureMessage = {
    [key in DynamicReconfigureCategories]: IDynamicReconfigureParameter[]
}

export interface IDynamicReconfigureEmptyConfig {
    config: {}
}

export interface IDynamicReconfigureConfig {
    config: DynamicReconfigureMessage
}

export interface IDynamicReconfigureDataTypes {
    [key: string]: DynamicReconfigureCategories
}

export interface IDynamicConfiguration {
    [key: string]: string | number | boolean | any
}
