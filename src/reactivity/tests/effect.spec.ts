import { effect } from "../effect";
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
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        //update
        user.age++
        expect(nextAge).toBe(12)
    })
});