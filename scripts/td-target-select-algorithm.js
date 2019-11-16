import { distance, randomInt, assert } from "./td-utils.js";

export const AimAlgorithm = Object.freeze({
    highestHp:0,
    lowestHp:1,
    random:2,
    noSort:3,
    MAX:4
});

export function getAimAlgorithmOfType(type)
{
    switch (type)
    {
        case AimAlgorithm.highestHp:
            return new CTargetSelectHighestHp();
        case AimAlgorithm.lowestHp:
            return new CTargetSelectLowestHp();
        case AimAlgorithm.random:
            return new CTargetSelectRandom();
        case AimAlgorithm.noSort:
            return new CTargetSelectNoSort();
        default:
            assert(false);
    }
}

class ITargetSelectAlgorithm
{
    getType() {}
    getDescription() {}
    getSortedTargets(enemies, tower) {}
}

export class CTargetSelectLowestHp extends ITargetSelectAlgorithm
{   
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return inRange.sort(CTargetSelectLowestHp.sortByLowersHp);
    }

    getType()
    {
        return AimAlgorithm.lowestHp;
    }

    getDescription() 
    {
        return "Attack Lowest HP";
    }

    static sortByLowersHp(l, r)
    {
        return l.hp - r.hp;
    }
}

export class CTargetSelectHighestHp extends ITargetSelectAlgorithm
{   
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return inRange.sort(CTargetSelectHighestHp.sortByHighesHp);
    }

    getType()
    {
        return AimAlgorithm.highestHp;
    }

    getDescription() 
    {
        return "Attack Highest HP";
    }

    static sortByHighesHp(l, r)
    {
        return r.hp - l.hp;
    }
}

export class CTargetSelectNoSort extends ITargetSelectAlgorithm
{
    getSortedTargets(enemies, tower)
    {
        return enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
    }

    getType()
    {
        return AimAlgorithm.noSort;
    }

    getDescription() 
    {
        return "Attack In Order";
    }
}

export class CTargetSelectRandom extends ITargetSelectAlgorithm
{
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return CTargetSelectRandom.shuffleArray(inRange);
    }

    getType()
    {
        return AimAlgorithm.random;
    }

    getDescription() 
    {
        return "Attack Random";
    }

    static shuffleArray(array)
    {
        for (let i = 0; i < array.length; i++)
        {
            const swapIndex = randomInt(0, array.length);
            [array[swapIndex], array[i]] = [array[i], array[swapIndex]];
        }

        return array;
    }
}