import {CMazeTest} from './td-maze.js';
import {CUtilsTest} from './td-utils.js';
import {CFloorLayerTest} from './td-layer-floor.js';
import {CDecorationsLayerTest} from './td-layer-decorations.js';
import { CRandomLevelTest } from './td-level-random.js';

const TEST_CONFIG_ADD_TIMEOUT = false;

class CTest 
{ 
    static async run()
    {
        await CFloorLayerTest.run();
        await CDecorationsLayerTest.run();
        await CRandomLevelTest.run();
        
        CUtilsTest.run();
        CMazeTest.run();
    }
}

if (TEST_CONFIG_ADD_TIMEOUT) {
    setTimeout(function(){ CTest.run(); }, 3000);
}
else {
    CTest.run();
}
