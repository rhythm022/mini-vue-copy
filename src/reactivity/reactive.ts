import { track } from "./effect"
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

            // TODO 触发effect
            return res
        }
    })
}