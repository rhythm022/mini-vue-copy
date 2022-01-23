import { effect,stop} from "../effect";
import { reactive } from "../reactive";

describe('effect', () => {
    it('happy path',()=>{
        // 有人set这些对象属性的时候，get这些对象属性的函数需要重新执行
        // 所以说，effect fn必然get响应式对象
        const user = reactive({
            age:10
        })

        let nextAge
        effect(()=>{
            nextAge = user.age
        })
        expect(nextAge).toBe(10)

        user.age++ // set
        expect(nextAge).toBe(11)
    })

    it('should return runner when call effect',()=>{
        let foo = 10
        const runner = effect(()=>{
            foo++
            return 'answer'
        })
        expect(foo).toBe(11)

        const res = runner()// 手动执行
        expect(foo).toBe(12)
        expect(res).toBe('answer')
    })

    it("scheduler", () => {
        // 1. 通过 effect 的第二个参数给定的 一个 scheduler
        // 2. effect 第一次执行时 还会执行 fn
        // 3. 当响应式对象属性 set 时， 不执行 fn 而是执行scheduler
        // 4. 只有当执行 runner 的时候，会执行 fn
        let dummy
        let run
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(() => {
            dummy = obj.foo
        }, { scheduler })

        // effect 执行，effect fn 不执行
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)

        // 对象属性 set 时，effect fn 不执行
        obj.foo++ // set
        expect(scheduler).toBeCalledTimes(1)
        expect(dummy).toBe(1)

        // 调用 ReactiveEffect 的 run，effect fn 执行
        run()
        expect(dummy).toBe(2)

    })

    it('stop',()=>{
        let dummy
        const obj = reactive({foo:1})
        const runner = effect(()=>{
            dummy = obj.foo
        })

        // set
        obj.foo = 2
        expect(dummy).toBe(2)

        stop(runner)

        // stop后set
        obj.foo = 3
        expect(dummy).toBe(2)

        // run
        runner();
        expect(dummy).toBe(3)

        // set
        obj.foo = 4
        expect(dummy).toBe(3)
    })

    it('onStop',()=>{
        const obj = reactive({
            foo:1
        })
        const onStop = jest.fn()
        let dummy
        const runner = effect(()=>{
            dummy = obj.foo
        },{ onStop })

        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
});