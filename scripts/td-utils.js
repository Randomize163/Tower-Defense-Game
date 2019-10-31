// 
// returns random integer in [min, max) interval
//
export function randomInt(min, max)
{
    return min + Math.floor(Math.random() * (max - min));
}

export function randomBoolWithProbability(trueProbability)
{
    assert(0 <= trueProbability <= 1);
    if (trueProbability == 0) {
        return false;
    }

    if (trueProbability == 1) {
        return true;
    }

    return Math.random() <= trueProbability;
}

//
// randomChoice() - returns one of options values according to their probabilities
// options = [{'value':0, 'prob':0.2}]
// sum of probabilities must be equal to 1
//
export function randomChoice(options)
{
    assert(options.map(option => option.prob).reduce((acc, curr) => acc + curr) == 1);
    const rand = Math.random();

    let [intervalL, intervalR] = [0, 0];
    for (let i = 0; i < options.length; i++)
    {
        intervalL = intervalR;
        intervalR += options[i].prob;

        if (intervalL <= rand && rand < intervalR)
        {
            return options[i].value;
        }
    }

    assert(false);
    return null;
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