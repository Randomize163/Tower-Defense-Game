import { AssetType } from './td-asset.js';

const enemyAttackDescriptionDefault = [
    {
        'name':"Wave 1",
        'cooldown':3000,
        'enemies': [
            {
                'type':AssetType.enemyBasic,
                'speed':0.001,
                'hp':50,
                'count':5,
                'cost':10,
                'timeout':1000,
            },
            {
                'type':AssetType.enemyTankGreen,
                'speed':0.0005,
                'hp':100,
                'count':1,
                'cost':20,
                'timeout':0,
            },
        ],
    },
    {
        'name':"Wave 2",
        'cooldown':3000,
        'enemies': [
            {
                'type':AssetType.enemyBasic,
                'speed':0.002,
                'hp':50,
                'count':10,
                'cost':10,
                'timeout':300,
            },
            {
                'type':AssetType.enemyTankGreen,
                'speed':0.001,
                'hp':50,
                'count':5,
                'cost':10,
                'timeout':1000,
            },
        ],
    },
    {
        'name':"Wave 3",
        'cooldown':3000,
        'enemies': [
            {
                'type':AssetType.enemyBasic,
                'speed':0.002,
                'hp':50,
                'count':10,
                'cost':15,
                'timeout':200,
            },
            {
                'type':AssetType.enemyTankGreen,
                'speed':0.001,
                'hp':50,
                'count':5,
                'cost':10,
                'timeout':2000,
            },
            {
                'type':AssetType.enemyBasic,
                'speed':0.002,
                'hp':50,
                'count':10,
                'cost':15,
                'timeout':200,
            },
        ],
    },
    {
        'name':"Wave 4",
        'cooldown':3000,
        'enemies': [
            {
                'type':AssetType.enemyTankWhite,
                'speed':0.002,
                'hp':50,
                'count':5,
                'cost':10,
                'timeout':2000,
            },
            {
                'type':AssetType.enemyBasic,
                'speed':0.002,
                'hp':50,
                'count':50,
                'cost':15,
                'timeout':200,
            },
            {
                'type':AssetType.enemyTankGreen,
                'speed':0.001,
                'hp':500,
                'count':2,
                'cost':100,
                'timeout':8000,
            },
        ],
    },
    {
        'name':"Wave 5 - Final Wave",
        'cooldown':3000,
        'enemies': [
            {
                'type':AssetType.enemyTankWhite,
                'speed':0.002,
                'hp':500,
                'count':3,
                'cost':10,
                'timeout':2000,
            },
            {
                'type':AssetType.enemyBasic,
                'speed':0.002,
                'hp':50,
                'count':50,
                'cost':15,
                'timeout':200,
            },
            {
                'type':AssetType.enemyTankGreen,
                'speed':0.001,
                'hp':100,
                'count':50,
                'cost':100,
                'timeout':8000,
            },
        ],
    },
];

const generationDefaultParams = {
    'wavesCount':100,
    'cooldown':3000,
    'regularEnemy': {
        'type':AssetType.enemyBasic,
        'cost':10,
        'hp':100,
        'speed': 0.001,
        'beginCount':5,
        'countDelta':5,
        'countAccel':5,
        'timeout':300,
    },
    'tankEnemy': {
        'type':AssetType.enemyTankGreen,
        'cost':50,
        'hp':500,
        'speed': 0.0005,
        'beginCount':1,
        'countDelta':2,
        'countAccel':2,
        'timeout':1000,
    },
    'fastRegularEnemy': {
        'type':AssetType.enemyBasicFast,
        'cost':20,
        'hp':100,
        'speed': 0.002,
        'beginCount':0,
        'countDelta':1,
        'countAccel':2,
        'timeout':500,
    },
    'fastTankEnemy': {
        'type':AssetType.enemyTankWhite,
        'cost':100,
        'hp':500,
        'speed': 0.001,
        'beginCount':0,
        'countDelta':1,
        'countAccel':2,
        'timeout':500,
    },
};

function getSquareFunc(x0, v, a, t)
{
    return x0 + v*t + a * (t ** 2) / 2;
}

function getEnemiesWithParams(params, count)
{
    return {
        'type':params.type,
        'speed':params.speed,
        'hp':params.hp,
        'count':count,
        'cost':params.cost,
        'timeout':params.timeout,
    };
}

export function generateWaveDescription(params = generationDefaultParams)
{
    let attackDescription = [];
    for (let waveIndex = 0; waveIndex < params.wavesCount; waveIndex++)
    {
        const wave = {};
        wave.name = `Wave ${waveIndex + 1}`;
        wave.cooldown = params.cooldown;
        wave.enemies = [];
        
        const regCount = Math.floor(getSquareFunc(params.regularEnemy.beginCount, params.regularEnemy.countDelta, params.regularEnemy.countAccel, waveIndex));
        const tankCount = Math.floor(getSquareFunc(params.tankEnemy.beginCount, params.tankEnemy.countDelta, params.tankEnemy.countAccel, waveIndex));
        const fastCount = Math.floor(getSquareFunc(params.fastRegularEnemy.beginCount, params.fastRegularEnemy.countDelta, params.fastRegularEnemy.countAccel, waveIndex));
        const fastTank = Math.floor(getSquareFunc(params.fastTankEnemy.beginCount, params.fastTankEnemy.countDelta, params.fastTankEnemy.countAccel, waveIndex));

        if (regCount > 0) wave.enemies.push(getEnemiesWithParams(params.regularEnemy, regCount));
        if (fastCount > 0) wave.enemies.push(getEnemiesWithParams(params.fastRegularEnemy, fastCount));
        if (tankCount > 0) wave.enemies.push(getEnemiesWithParams(params.tankEnemy, tankCount));
        if (fastTank > 0) wave.enemies.push(getEnemiesWithParams(params.fastTankEnemy, fastTank));

        attackDescription.push(wave);
    }

    return attackDescription;
}

export class CEnemyAttack 
{
    constructor(gameManager, enemyAttackDescription = enemyAttackDescriptionDefault)
    {
        this.gameManager = gameManager;
        this.enemyAttackDescription = enemyAttackDescription;
        this.currentWave = 0;
        this.enemies = [];

        this.beginWave = true;
        this.currentEnemyBlockIndex = 0;
        this.currentEnemyIndex = 0;
        this.nextEnemySpawnTimeout = this.enemyAttackDescription[this.currentWave].enemies[this.currentEnemyBlockIndex].timeout;
        this.nextWaveCooldown = this.enemyAttackDescription[this.currentWave].cooldown;
    }

    getCurrentWaveDescription() 
    {
        if (!this.beginWave) return this.enemyAttackDescription[this.currentWave - 1];

        return this.enemyAttackDescription[this.currentWave];
    }

    calculate(deltaTime)
    {
        if (this.finished) return;

        if (!this.beginWave)
        {
            return;
        }

        if (this.currentEnemyBlockIndex == 0 && this.nextWaveCooldown > 0)
        {
            // Wait for next wave timeout
            this.nextWaveCooldown = Math.max(this.nextWaveCooldown - deltaTime, 0);
            return;
        }

        // Wave is playing
        if (this.nextEnemySpawnTimeout > 0)
        {
            // Wait for enemy spawn
            this.nextEnemySpawnTimeout = Math.max(this.nextEnemySpawnTimeout - deltaTime, 0);
            return;
        }

        // Spawn an enemy
        const currentWave = this.enemyAttackDescription[this.currentWave];
        const currentBlock = currentWave.enemies[this.currentEnemyBlockIndex];
        this.gameManager.addEnemy(currentBlock.type, currentBlock.hp, currentBlock.speed, currentBlock.cost);
        
        this.nextEnemySpawnTimeout = currentBlock.timeout;
        this.currentEnemyIndex += 1;
        if (this.currentEnemyIndex == currentBlock.count)
        {
            // Move to next enemy block
            this.currentEnemyIndex = 0;
            this.currentEnemyBlockIndex += 1;
            if (this.currentEnemyBlockIndex == currentWave.enemies.length)
            {
                // Move to next wave
                if (this.currentWave + 1 == this.enemyAttackDescription.length)
                {
                    // Finished all waves
                    this.finished = true;
                    return;
                }

                this.currentWave += 1;
                this.currentEnemyBlockIndex = 0;
                this.nextWaveCooldown = this.enemyAttackDescription[this.currentWave].cooldown;
                this.beginWave = false;
            }
        }
    }

    beginNextWave() 
    {
        this.beginWave = true;
    }
} 