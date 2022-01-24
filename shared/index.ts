export const extend = Object.assign

export const isObject = target =>target !== null && typeof target === 'object' // Array is Object

export const hasChanged = (value,newValue)=>{
    return !Object.is(newValue,value)
}