import {trackEffects,triggerEffects} from './effect'
import {hasChanged,isObject} from "../../shared";
import {reactive} from "./reactive";

class RefImp{
    public __v_isRef = true
    private _rawValue: any;
    private _value: any;
    public dep
    // effect.ts 的 track 是 reactive对象专属的，所以，effect.ts 的 objMap 是 reactive对象专属的
    // 所有 reactive对象 收集来的 effect 都会集中地储存在 集中的objMap中
    constructor(value){
        this._rawValue = value
        this._value = convertToReactive(value)
        this.dep = new Set() // 而 ref 的 dep 则分散地储存在自己这儿
    }

    get value(){
        trackEffects(this.dep)

        return this._value
    }

    set value(value){
        if(!hasChanged(value,this._value))return

        this._rawValue = value
        this._value = convertToReactive(value)

        triggerEffects(this.dep)
    }
}

function convertToReactive(value){
    return isObject(value) ?  reactive(value) : value

}

export function ref(value) {
    return new RefImp(value)
}


export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref // ??应该拿 _rawValue
}

export function proxyRefs(objectWithRefs){
    return new Proxy(objectWithRefs,{
        get(target,key){
            // 如果 get 的是 ref 则返回 ref.value ，否则正常 get
            return unRef(Reflect.get(target,key))

        },
        set(target,key,value){
            // 如果 set 的是 ref，则 ref.value = value ，否则正常 set
            if(isRef(target[key]) && !isRef(value)){
                return (target[key].value = value)
            }

            return Reflect.set(target,key,value)

        },
    })
}