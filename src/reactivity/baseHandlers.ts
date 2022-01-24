import { track, trigger } from "./effect"
import { ReactiveFlags,reactive,readonly } from "./reactive"
import { isObject,extend } from '../../shared'

function createGetter(isReadonly = false,isShallow = false) {
    // 被 get 的属性，就能去收集 effect
    return function get(raw, key) {
        const res = Reflect.get(raw, key)

        if( key === ReactiveFlags.IS_REACTIVE ){ // cool!! 在proxy里做实现
            return !isReadonly
        }
        if(key === ReactiveFlags.IS_READONLY){
            return isReadonly
        }

        if(isShallow && isReadonly){
            return res
        }

        if (!isReadonly) {
            track(raw, key) // track raw[key]
        }

        // 如果对象属性是对象的话，除了对象属性做track，返回时，对象属性的 res 还要转成 reactive对象，再返回
        if(isObject(res)){
            // nested对象 成为了 reactive对象，意味着，该对象的属性可以在 effect fn 中收集 effect
            // 只有访问了某个子对象，这个对象才会被临时地reactive化了，每次返回的 reactive对象 都不是同一个
            return isReadonly ? readonly(res) : reactive(res)// reactive raw[key]
        }
        return res // 否则直接返回
    }
}

function createSetter() {
    return function set(raw, key, value) {
        const res = Reflect.set(raw, key, value)

        trigger(raw, key)

        return res
    }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)


export const reactiveHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,
    set(raw, key, value) {
        console.warn(`can not set readonly object ${raw} ${key}`)

        return true
    }
}


export const shallowReadonlyHandler =extend({},readonlyHandler,{
    get: shallowReadonlyGet,

})