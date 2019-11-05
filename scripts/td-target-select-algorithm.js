import { distance, randomInt } from "./td-utils.js";

class ITargetSelectAlgorithm
{
    getSortedTargets(enemies, tower) {}
}

export class CTargetSelectLowestHp extends ITargetSelectAlgorithm
{   
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return inRange.sort(CTargetSelectLowestHp.sortByLowersHp);
    }

    static sortByLowersHp(l, r)
    {
        return l.hp - r.hp;
    }
}

export class CTargetHighestHp extends ITargetSelectAlgorithm
{   
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return inRange.sort(CTargetSelectHighestHp.sortByHighesHp);
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
}

export class CTargetSelectRandom extends ITargetSelectAlgorithm
{
    getSortedTargets(enemies, tower)
    {
        const inRange = enemies.filter((enemy) => distance(enemy.tilesX, enemy.tilesY, tower.tilesX, tower.tilesY) <= tower.range);
        return CTargetSelectRandom.shuffleArray(inRange);
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