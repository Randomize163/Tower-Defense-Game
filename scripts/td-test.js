import {CMazeTest} from './td-maze.js';
import {CUtilsTest, sleep, randomInt} from './td-utils.js';
import {CFloorLayerTest} from './td-layer-floor.js';
import {CDecorationsLayerTest} from './td-layer-decorations.js';
import { CRandomLevelTest, CRandomLevel } from './td-level-random.js';
import { CKenneyAssetsCollection, AssetType } from './td-asset.js';
import { Camera } from './td-camera.js';
import { CRocketTower, CBullet } from './td-tower.js';
import { CEnemy } from './td-enemy.js';

const TEST_CONFIG_ADD_TIMEOUT = false;

class CTest 
{ 
    static async run()
    {
        //await CFloorLayerTest.run();
        //await CDecorationsLayerTest.run();
        //await CRandomLevelTest.run();
        //await CTest.towerTest();
        await CTest.enemyTest();
        //CUtilsTest.run();
        //CMazeTest.run();
    }

    static async towerTest()
    {
        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let level = new CRandomLevel(3,3);

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        level.display(ctx, tiles, camera);
        
        const tower = new CRocketTower(1, 1);
        tower.display(ctx, tiles, camera);
    }

    static async enemyTest()
    {
        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let level = new CRandomLevel(6,3);

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight, 64);
        
        const enemies = [];
        const runningEnemies = [];
        for (let i = 0; i < 10; i++)
        {
            const enemy = new CEnemy(level.getBegin()[0] + Math.random(), level.getBegin()[1] + Math.random() , 0, 0.0025, 100, 100, 0.1, AssetType.enemyTankGreen);
            enemy.setPath(level.getPath());

            enemies.push(enemy);
        }

        const timeDelta = 20;
        setInterval(() => {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                level.display(ctx, tiles, camera);
                runningEnemies.forEach((enemy) => {
                    enemy.calculate(timeDelta);
                    enemy.display(ctx, tiles, camera);
                });
            },
            timeDelta);

        setInterval(() => {
            if (runningEnemies.length == 0) return;
            runningEnemies[randomInt(0, runningEnemies.length)].hit(10);
        },
        100);
        
        for (let i = 0; i < enemies.length; i++)
        {
            runningEnemies.push(enemies[i]); 
            await sleep(500);
        }   
    }
}

if (TEST_CONFIG_ADD_TIMEOUT) {
    setTimeout(function(){ CTest.run(); }, 3000);
}
else {
    CTest.run();
}
