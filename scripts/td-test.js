import {CMapTest} from './td-map.js';

const TEST_CONFIG_ADD_TIMEOUT = false;

class CTest 
{
    static run()
    {
       CMapTest.run(); 
    }
}

if (TEST_CONFIG_ADD_TIMEOUT) {
    setTimeout(function(){ CTest.run(); }, 3000);
}
else {
    CTest.run();
}
