import {trackEffects,triggerEffects} from './effect'
import {hasChanged,isObject} from "../../shared";
import {reactive} from "./reactive";

class RefImp{
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