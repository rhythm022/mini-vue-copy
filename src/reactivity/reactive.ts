import { track,trigger } from "./effect"
// reactive只是个没有自身行为的代理
export function reactive(raw){
    return new Proxy(raw,{
        // 拦截的是 某个对象的某个属性
        get(obj,key){
            const res = Reflect.get(obj,key)

            // 收集 ReactiveEffect
            track(obj,key)
            return res
        },
        set(obj,key,value){
            const res = Reflect.set(obj,key,value)

            trigger(obj,key)
            return res
        }
    })
}

export function readonly(raw){
    return new Proxy(raw,{
        get(obj,key){// get 时不 track
            return Reflect.get(obj,key)
        },
        set(obj,key,value){// 更不可 set
            return true
        }
    })
}