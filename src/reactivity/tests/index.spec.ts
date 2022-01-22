import {add} from '../index'
it('init',()=>{
    console.log('test')
    expect(true).toBe(true)
})


it('add',()=>{
    console.log('babel')

    expect(add(1,2)).toBe(3)
})