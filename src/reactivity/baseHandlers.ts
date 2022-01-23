import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

function createGetter(isReadonly = false) {
    return function get(obj, key) {
        const res = Reflect.get(obj, key)

        if( key === ReactiveFlags.IS_REACTIVE ){ // cool!! 在proxy里做实现
            return !isReadonly
        }
        if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }

        if (!isReadonly) {
            track(obj, key)
        }

        return res
    }
}

function createSetter() {
    return function set(obj, key, value) {
        const res = Reflect.set(obj, key, value)

        trigger(obj, key)

        return res
    }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export const reactiveHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,
    set(obj, key, value) {
        console.warn(`can not set readonly object ${obj} ${key}`)

        return true
    }
}