import {CMazeTest} from './td-maze.js';
import {CUtilsTest} from './td-utils.js';
import {CFloorLayerTest} from './td-layer-floor.js';
import {CDecorationsLayerTest} from './td-layer-decorations.js';
import { CRandomLevelTest, CRandomLevel } from './td-level-random.js';
import { CKenneyAssetsCollection, AssetType } from './td-asset.js';
import { Camera } from './td-camera.js';
import { RocketTower } from './td-tower.js';
import { CEnemy } from './td-enemy.js';

const TEST_CONFIG_ADD_TIMEOUT = false;

class CTest 
{ 
    static async run()
    {
        //await CFloorLayerTest.run();
        //await CDecorationsLayerTest.run();
        //await CRandomLevelTest.run();
        await CTest.towerTest();
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
        
        const tower = new RocketTower(1, 1);
        tower.display(ctx, tiles, camera);
    }

    static async enemyTest()
    {
        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let level = new CRandomLevel(3,3);

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        level.display(ctx, tiles, camera);

        const enemy = new CEnemy(2.5, 2.5, 90, 0.05, 100, 100, 0.1, AssetType.enemyBasic);
        enemy.display(ctx, tiles, camera);
    }
}

if (TEST_CONFIG_ADD_TIMEOUT) {
    setTimeout(function(){ CTest.run(); }, 3000);
}
else {
    CTest.run();
}
