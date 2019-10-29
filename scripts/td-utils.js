export class CUtils
{
    // 
    // returns random integer in [min, max) interval
    //
    static randomInt(min, max)
    {
        return min + Math.floor(Math.random() * (max - min));
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
            
            const result = CUtils.randomInt(min, max);
            console.assert(min <= result && min < max);
        }    
        console.log("randomIntTest finished successfully!");
    } 

    static run()
    {
        CUtilsTest.randomIntTest();
    }
}

export function assert(expression)
{
    if (!expression) {
        debugger;
    }
}