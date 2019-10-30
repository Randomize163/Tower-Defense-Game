import {CMapTest, CMazeTest} from './td-map.js';
import {CUtilsTest} from './td-utils.js';

const TEST_CONFIG_ADD_TIMEOUT = false;

class CTest 
{
    static run()
    {
        //CMazeTest.run();
        CMapTest.run(); 
        CUtilsTest.run();
    }
}

if (TEST_CONFIG_ADD_TIMEOUT) {
    setTimeout(function(){ CTest.run(); }, 3000);
}
else {
    CTest.run();
}
