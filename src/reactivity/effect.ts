const objMap = new Map()

let currentEffect

class ReactiveEffect{
    private _fn: any
    constructor(fn){
        this._fn = fn
    }

    run(){
        currentEffect = this
        this._fn()
        currentEffect = null
    }
}


// track某个对象的某个属性
// currentEffect === 当前正在执行的 ReactiveEffect
export function track(obj,key){
    if(!currentEffect) return
    let keysMap = objMap.get(obj)
    if(!keysMap){
        keysMap = new Map()
        objMap.set(obj,keysMap)
    }

    let dep = keysMap.get(key)
    if(!dep){
        dep = new Set()
        keysMap.set(key,dep)
    }
    dep.add(currentEffect)

}

export function trigger(obj,key) {
    let keysMap = objMap.get(obj)
    let dep = keysMap.get(key)
    for(const effect of dep){
        effect.run()
    }
}
// effect函数的职责是调用fn，并在这个过程中让fn中每个响应式对象的每个属性都拥有 ReactiveEffect 对象
export function effect(fn){
    const _effect = new ReactiveEffect(fn)

    _effect.run()
}