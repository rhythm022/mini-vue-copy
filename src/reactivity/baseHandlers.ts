import { track, trigger } from "./effect"

function createGetter(isReadonly = false) {
    return function get(obj, key) {
        const res = Reflect.get(obj, key)

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
        return true
    }
}