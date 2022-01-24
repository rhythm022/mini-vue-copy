import { extend } from '../../shared'
const objMap = new Map()

let currentEffect
let enableTrack
export class ReactiveEffect{
    private _fn: any
    deps = []
    isRunning = true
    onStop?: () => void
    constructor(fn,public scheduler?){
        this._fn = fn
    }

    run(){
        if(!this.isRunning){
            return this._fn()
        }

        enableTrack = true
        currentEffect = this
        const res = this._fn()
        enableTrack = false

        return res
    }

    stop(){ // stop 后响应式效果就消失了，就只能手动 run
        if(this.isRunning){
            clearUpEffect(this)
            if(this.onStop){
                this.onStop()
            }
            this.isRunning = false
        }
    }
}

function clearUpEffect(effect){
    effect.deps.forEach((dep:any)=>{
        dep.delete(effect)
    })

    effect.deps.length = 0
}

// track某个对象的某个属性
// currentEffect === 当前正在执行的 ReactiveEffect
export function track(obj,key){
    if(!enableTrack) return
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

    trackEffects(dep)
}

export function trackEffects(dep){
    if(!enableTrack) return

    if(!dep.has(currentEffect)){
        dep.add(currentEffect)
        currentEffect.deps.push(dep)
    }
}

export function trigger(obj,key) {
    let keysMap = objMap.get(obj)
    let dep = keysMap.get(key)

    triggerEffects(dep)
}

export function triggerEffects(dep){
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
    const reactiveEffect = new ReactiveEffect(fn,options.scheduler)
    extend(reactiveEffect,options)
    reactiveEffect.run()

    // 将ReactiveEffect的run通过返回值暴露，调用run：
    // 可以用来执行 effect fn，
    // 可以用来 track effect fn，即 run effect fn
    // 可以用来拿到 effect fn 的返回值
    const run :any= reactiveEffect.run.bind(reactiveEffect)
    run.effect =  reactiveEffect // core!!
    return run
}

export function stop(run) {
    // 一个 effect 是多个对象属性的 effect
    run.effect.stop() // 停止一个 effect 是停止 多个对象属性的 effect

}