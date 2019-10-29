// 
// returns random integer in [min, max) interval
//
export function randomInt(min, max)
{
    return min + Math.floor(Math.random() * (max - min));
}

export function assert(expression)
{
    if (!expression) {
        debugger;
    }
}

export class Stack 
{
    constructor()
    {
        this.arr = [];
    }

    push(elem)
    {
        this.arr.push(elem);
    }

    pop()
    {
        return this.arr.pop();
    }

    top()
    {
        if (this.arr.length == 0)
        {
            throw new Error('Stack is empty!');
        }
        
        return this.arr[this.arr.length - 1];
    }

    size()
    {
        return this.arr.length;
    }

    isEmpty()
    {
        return this.size() == 0;
    }
}

export class CUtilsTest
{
    static randomIntTest()
    {
        for (let i = 0; i < 1000000; i++)
        {
            const min = Math.random() * 1000;
            const max = Math.random() * 1000 + min;
            
            const result = randomInt(min, max);
            console.assert(min <= result && min < max);
        }    
        console.log("randomIntTest finished successfully!");
    } 

    static run()
    {
        CUtilsTest.randomIntTest();
    }
}