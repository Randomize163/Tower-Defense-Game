class CTest 
{
    static run()
    {
       CMapTest.run(); 
    }
}

if (1) {
    setTimeout(function(){ CTest.run(); }, 6000);
}
else
{
    CTest.run();
}
