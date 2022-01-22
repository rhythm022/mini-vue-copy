const objMap = new Map()

let currentEffect

class ReactiveEffect{
    private _fn: any
    constructor(fn,public scheduler?){
        this._fn = fn
    }

    run(){
        currentEffect = this
        const res = this._fn()
        currentEffect = null

        return res
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
        if(effect.scheduler){
            effect.scheduler()// 有scheduler时，set对象属性时，就执行scheduler，不执行effect fn
        }else{
            effect.run()
        }
    }
}
// effect函数的职责是调用fn，并在这个过程中让fn中每个响应式对象的每个属性都拥有 ReactiveEffect 对象
export function effect(fn,options:any = {}){
    const _effect = new ReactiveEffect(fn,options.scheduler)

    _effect.run()

    // 将ReactiveEffect的run通过返回值暴露，调用run：
    // 可以用来执行 effect fn，
    // 可以用来 track effect fn，
    // 可以用来拿到 effect fn 的返回值
    return _effect.run.bind(_effect)
}