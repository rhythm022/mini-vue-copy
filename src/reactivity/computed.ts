import { ReactiveEffect } from "./effect"

class ComputedRefImpl{
    private _getter: any
    private _value: any
    private _dirty: boolean = true // cool!!
    private _effect: any

    constructor(getter){
        this._getter = getter

        // 状态 set 后，会触发 scheduler 执行。这样，有状态 set 后，effect 必然变脏。
        this._effect = new ReactiveEffect(getter,()=>{ if(!this._dirty) this._dirty = true })

        // effect 没有一上来就 run
    }

    get value(){
        if(this._dirty){
            this._value =  this._effect.run() // 有没有 scheduler ，effect 都会在 run 时收集对象属性

            this._dirty = false
        }

        return this._value

    }
}



export function computed(getter){
    return new ComputedRefImpl(getter)
}