import {assert, randomInt, Stack, randomBoolWithProbability} from './td-utils.js';
import {AssetType, IAssetCollection, CKenneyAssetsCollection} from './td-asset.js';

const TilesType = Object.freeze(
    {
        "empty":AssetType.emptyTile, 
        "path":AssetType.roadTile, 
        "build":AssetType.towerTile,
        "spawn":AssetType.begin,
        "base":AssetType.end,
        "solution":5,
        "removedPath":6,
    });

const WallsType = Object.freeze(
    {
        "left":0x1000, 
        "right":0x0100, 
        "up":0x0010,
        "down":0x0001,
        "all":0x1111
    });  

class CMap
{
    constructor(width, height) 
    {
        this.width = width;
        this.height = height;
    }

    generateMap(mapParams = {'fillFactor':0.70})
    {
        this.initializeMapWithRandomPath();
        this.addRandomTowerTiles(mapParams.fillFactor);
    }

    addRandomTowerTiles(fillFactor)
    {
        for (let i = 0; i < this.tilesMap.length; i++)
        {
            for (let j = 0; j < this.tilesMap[0].length; j++)
            {
                if (this.tilesMap[i][j] != TilesType.empty) {
                    continue;
                }

                const neighbours = CMaze.getNeighboursCoordinates(i, j, this.tilesMap.length, this.tilesMap[0].length);
                const isCloseToPath = neighbours.some(
                    ([x, y]) =>
                    {
                        return this.tilesMap[x][y] == TilesType.path;
                    }
                );

                if (!isCloseToPath) {
                   continue;
                }
                    
                if (randomBoolWithProbability(fillFactor))
                {
                    this.tilesMap[i][j] = TilesType.build;
                }
            }
        }
    }

    initializeMapWithRandomPath()
    {
        let maze = new CMaze(this.width, this.height);
        maze.addEntranceAndExitToMaze();
    
        this.tilesMap = Array.from(Array(maze.width), () => new Array(maze.height).fill(TilesType.empty));
        this.width = maze.width;
        this.height = maze.height;

        let path = maze.findLongestSolutionPath(false);
        path.forEach(([x,y]) => {this.tilesMap[x][y] = TilesType.path});

        this.path = path;
        this.begin = path[0];
        this.end = path[path.length - 1]; 
    }

    //
    // draw() - ctx is a canvas.getContext('2d'); tiles is an instance of IAssetCollection
    //
    draw(ctx, tiles)
    {
        let dTileSize = 64;
        let [dx, dy] = [0, 0];

        for (let i = 0; i < this.tilesMap.length; i++)
        {
            for (let j = 0; j < this.tilesMap[0].length; j++)
            {
                const asset = tiles.getAsset(this.tilesMap[i][j]);
                ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, dx, dy, dTileSize, dTileSize);
                dx += dTileSize;
            }
            dy += dTileSize;
            dx = 0;
        }
    }

    static generateMapTest()
    {
        let map = new CMap(3,3);
        map.generateMap({});
        console.log(map);
    }

    static async drawMapTest()
    {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let map = new CMap(3,5);
        map.generateMap();

        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();
        map.draw(ctx, tiles);
    }
}    

export class CMapTest 
{
    static run()
    {
        CMap.generateMapTest();
        CMap.drawMapTest();
    }
}

class CMaze
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.mazePixels = [];
        this.mazeTiles = [];
        
        this.initializeMazeTiles();
        this.generateMazeTiles();
        this.transformMazeToPixels();
    }

    initializeMazeTiles()
    {
        this.mazeTiles = Array.from(Array(this.width), () => new Array(this.height));
        for (let i = 0; i < this.mazeTiles.length; i++)
        {
            for (let j = 0; j < this.mazeTiles[0].length; j++)
            {
                this.mazeTiles[i][j] = {
                    "tileType": TilesType.empty,
                    "walls": WallsType.all
                };
            }
        }
    }

    generateMazeTiles()
    {
        let visited = Array.from(Array(this.width), () => new Array(this.height).fill(false));
        let stack = new Stack();
        let startPosition = [randomInt(0, this.width), randomInt(0, this.height)];
        
        stack.push(startPosition);

        for (;;)
        {
            if (stack.isEmpty())
            {
                break;
            }

            let [currentX, currentY] = stack.top();
            visited[currentX][currentY] = true;
            
            // find potential nexts
            let nexts = this.getPotentialNextTilesFor(currentX, currentY, visited);
            if (nexts.length == 0)
            {
                stack.pop();
                continue;
            }

            // choose next
            let selectedNext = nexts[randomInt(0, nexts.length)];
            
            // break the wall
            let [nextX, nextY] = selectedNext.position;
            this.mazeTiles[nextX][nextY].walls       &= ~WallsType[selectedNext.breakWallForNext];
            this.mazeTiles[currentX][currentY].walls &= ~WallsType[selectedNext.direction];

            // go to next
            stack.push(selectedNext.position);
        }
    }

    getPotentialNextTilesFor(currentX, currentY, visited)
    {
        let nexts = [];
        if (currentX + 1 < this.mazeTiles.length && visited[currentX + 1][currentY] == false)
        {
            nexts.push({
                "position": [currentX + 1, currentY],
                "direction": 'right',
                "breakWallForNext": 'left'
            });
        }
        
        if (currentX - 1 >= 0 && visited[currentX - 1][currentY] == false)
        {
            nexts.push({
                "position": [currentX - 1, currentY],
                "direction": 'left',
                "breakWallForNext": 'right'
            });
        }
        
        if (currentY + 1 < this.mazeTiles[0].length && visited[currentX][currentY + 1] == false)
        {
            nexts.push({
                "position": [currentX, currentY + 1],
                "direction": 'up',
                "breakWallForNext": 'down'
            });
        }
        
        if (currentY - 1 >= 0 && visited[currentX][currentY - 1] == false)
        {
            nexts.push({
                "position": [currentX, currentY - 1],
                "direction": 'down',
                "breakWallForNext": 'up'
            });
        }

        return nexts;
    }

    transformMazeToPixels(addInternalWall = true)
    {
        this.mazePixels = Array.from({length: this.mazeTiles.length * 4 + 1}, e => Array(this.mazeTiles[0].length * 4 + 1).fill(TilesType.path));         

        for (let i = 0; i < this.mazeTiles.length; i++)
        {
            for (let j = 0; j < this.mazeTiles[0].length; j++)
            {
                this.transformTileToPixels(i, j, addInternalWall);
            }
        }

        this.width = this.mazePixels.length;
        this.height = this.mazePixels[0].length;
    }

    transformTileToPixels(i, j, addInternalWall = false)
    {
        let [pixelTileCenterX, pixelTileCenterY] = [2 + 4*i, 2 + 4*j];

        let tile = this.mazeTiles[i][j];

        if (addInternalWall)
        {
            this.mazePixels[pixelTileCenterX][pixelTileCenterY] = TilesType.empty;
        }

        if ((tile.walls & WallsType.left) != 0)
        {
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY]     = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY - 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY - 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY + 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY + 2] = TilesType.empty;
        }
        else if (addInternalWall)
        {
            this.mazePixels[pixelTileCenterX - 1][pixelTileCenterY] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY] = TilesType.empty;
        }

        if ((tile.walls & WallsType.right) != 0)
        {
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY]     = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY - 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY + 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY - 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY + 2] = TilesType.empty;
        }
        else if (addInternalWall)
        {
            this.mazePixels[pixelTileCenterX + 1][pixelTileCenterY] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY] = TilesType.empty;
        }

        if ((tile.walls & WallsType.up) != 0)
        {
            this.mazePixels[pixelTileCenterX][pixelTileCenterY + 2]     = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 1][pixelTileCenterY + 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 1][pixelTileCenterY + 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY + 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY + 2] = TilesType.empty;
        }
        else if (addInternalWall)
        {
            this.mazePixels[pixelTileCenterX][pixelTileCenterY + 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX][pixelTileCenterY + 2] = TilesType.empty;
        }

        if ((tile.walls & WallsType.down) != 0)
        {
            this.mazePixels[pixelTileCenterX][pixelTileCenterY - 2]     = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 1][pixelTileCenterY - 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 1][pixelTileCenterY - 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX + 2][pixelTileCenterY - 2] = TilesType.empty;
            this.mazePixels[pixelTileCenterX - 2][pixelTileCenterY - 2] = TilesType.empty;
        }
        else if (addInternalWall)
        {
            this.mazePixels[pixelTileCenterX][pixelTileCenterY - 1] = TilesType.empty;
            this.mazePixels[pixelTileCenterX][pixelTileCenterY - 2] = TilesType.empty;
        }
    }

    static mazePixelsToString(mazePixels)
    {
        let maze = "";
        for (let i = 0; i < mazePixels.length; i++) 
        {
            for (let j = 0; j < mazePixels[0].length; j++)
            {
                switch (mazePixels[i][j])
                {
                    case TilesType.empty:
                        maze += "▇";//"#";
                        break;
                    case TilesType.path:
                        maze += "　";//" ";
                        break;
                    case TilesType.base:
                        maze += "B";
                        break;
                    case TilesType.spawn:
                        maze += "S";
                        break;        
                    case TilesType.solution:
                        maze += "+"; 
                        break;    
                    case TilesType.removedPath:
                        maze += "x";
                        break;
                    default:
                        console.error("Unprintable tile type: " + mazePixels[i][j]);
                        debugger;
                }
            }

            maze += "\n";
        }

        return maze;
    }

    consoleLogMazePixels()
    {
        console.log("Print Maze (width: " + this.mazePixels.length + ", length: " + this.mazePixels[0].length + "):");
        console.log(CMaze.mazePixelsToString(this.mazePixels));
    }

    printMazePixelsToHtml(elementId)
    {
        let outputElement = document.getElementById(elementId);
        outputElement.innerHTML = CMaze.mazePixelsToString(this.mazePixels);
    }

    addEntranceAndExitToMaze()
    {
        this.entrance = this.selectRandomEntrance();
        
        const [entranceX, entranceY] = this.entrance;
        this.mazePixels[entranceX][entranceY] = TilesType.spawn;

        this.exit = this.selectRandomExit();

        const [exitX, exitY] = this.exit;
        this.mazePixels[exitX][exitY] = TilesType.base;
    }

    selectRandomEntrance()
    {
        const possible = this.findPossibleEntrancePixels();
        return possible[randomInt(0, possible.length)];
    }

    selectRandomExit()
    {
        const possible = this.findPossibleExitPixels();
        return possible[randomInt(0, possible.length)];
    }

    findPossibleEntrancePixels()
    {
        let result = [];
        for (let j = 0; j < this.mazePixels[0].length; j++)
        {
            if (this.pixelCouldBeEntrance(0, j))
            {
                result.push([0, j]);
            }
        }

        return result;
    }

    pixelCouldBeEntrance(i, j)
    {
        console.assert(i == 0);
        return this.mazePixels[i + 1][j] == TilesType.path;
    }

    findPossibleExitPixels()
    {
        let result = [];

        const lastColomn = this.mazePixels.length - 1;
        for (let j = 0; j < this.mazePixels[0].length; j++)
        {
            if (this.pixelCouldBeExit(lastColomn, j))
            {
                result.push([lastColomn, j]);
            }
        }

        return result;
    }

    pixelCouldBeExit(i, j)
    {
        console.assert(i == this.mazePixels.length - 1);
        return this.mazePixels[i - 1][j] == TilesType.path;
    }

    countPathPixels()
    {
        let path = 0;
        this.mazePixels.forEach((pixel) => {
            if (pixel == TilesType.path)
            {
                path++;
            }
        });

        return path;
    }

    findLongestSolutionPath(cleanSolutionPath = true)
    {
        let pathPixelsCount = this.calculatePathPixelsCount();
        let solution = this.findSolutionPath(false);

        const solutionPixelsCount = solution.length - 2;
        if (solutionPixelsCount * 2 >= pathPixelsCount)
        {
            return solution;
        }

        solution = this.findInvertSolutionPath(cleanSolutionPath);
        return solution;
    }

    calculatePathPixelsCount()
    {
        let count = 0;
        for (let i = 0; i < this.mazePixels.length; i++)
        {
            for (let j = 0; j < this.mazePixels[0].length; j++)
            {
                if (this.mazePixels[i][j] == TilesType.path)
                {
                    count++;
                }
            }
        }

        return count;
    }

    findInvertSolutionPath(cleanSolutionPath = true)
    {
        this.removeSolutionPath();
        return this.findSolutionPath(cleanSolutionPath);
    }

    removeSolutionPath()
    {
        for (let i = 0; i < this.mazePixels.length; i++)
        {
            for (let j = 0; j < this.mazePixels[0].length; j++)
            {
                if (this.mazePixels[i][j] == TilesType.solution)
                {
                    this.mazePixels[i][j] = TilesType.removedPath;
                }
            }
        }

        // change pixels near exit and entrance
        let [x,y] = this.entrance;
        this.mazePixels[x + 1][y] = TilesType.path;
        
        [x,y] = this.exit;
        this.mazePixels[x - 1][y] = TilesType.path;
    }

    findSolutionPath(cleanSolutionPath = true)
    {
        let solution = [this.entrance];

        for (;;)
        {
            let [currentX, currentY] = solution[solution.length - 1];
            let neighbours = CMaze.getNeighboursCoordinates(currentX, currentY, this.mazePixels.length, this.mazePixels[0].length);
            
            // Check if we are near exit
            const found = neighbours.find(([x, y]) => ((this.exit[0] == x) && (this.exit[1] == y)));
            if (found)
            {
                break;
            }

            neighbours = neighbours.filter((next) => {return this.mazePixels[next[0]][next[1]] == TilesType.path}); 
            assert(neighbours.length > 0);

            let next = neighbours[randomInt(0, neighbours.length)];
            
            this.mazePixels[next[0]][next[1]] = TilesType.solution;
            solution.push(next);
        }

        solution.push(this.exit);
        
        if (!cleanSolutionPath)
        {
            return solution;
        }
    
        solution.forEach(
            ([x, y], i) => {
                if (i == 0 || i == (solution.length - 1)) {
                    return;
                }
                
                this.mazePixels[x][y] == TilesType.path;
            }
        );
    
        return solution;
    }

    static getNeighboursCoordinates(i, j, imax, jmax)
    {
        let res = [];
        if (i > 0)
        {
            res.push([i - 1, j]);
        }
        if (i < imax - 1)
        {
            res.push([i + 1, j]);
        }
        if (j > 0)
        {
            res.push([i, j - 1]);
        }
        if (j < jmax - 1)
        {
            res.push([i, j + 1]);
        }
        
        return res;
    }

    static findLongestSolutionPathShortTest()
    {
        let maze = new CMaze(3, 3);
        maze.addEntranceAndExitToMaze();
        maze.consoleLogMazePixels();
        const pathLength = maze.calculatePathPixelsCount();
        const solution = maze.findLongestSolutionPath(false);
        maze.consoleLogMazePixels();
        console.assert((solution.length - 2) * 2 >= pathLength);
    }

    static findLongestSolutionPathTest()
    {
        for (let i = 0; i < 100; i++)
        {
            const width = randomInt(2, 500);
            const height = randomInt(2, 500);
            let maze = new CMaze(width, height);
            maze.addEntranceAndExitToMaze();
            const pathLength = maze.calculatePathPixelsCount();
            const solution = maze.findLongestSolutionPath();
            console.assert((solution.length - 2) * 2 >= pathLength);

            if (i % 10 == 0)
            {
                console.log("Finished iteration " + i);
            }
        }
        console.log("Finished findLongestSolutionPath test successfully!");
    }

    static findSolutionPathTest()
    {
        for (let i = 0; i < 100; i++)
        {
            const width = randomInt(2, 500);
            const height = randomInt(2, 500);
            let maze = new CMaze(width, height);
            maze.addEntranceAndExitToMaze();
            maze.findSolutionPath();

            if (i % 10 == 0)
            {
                console.log("Finished iteration " + i);
            }
        }
        console.log("Finished findSolutionPath test successfully!");
    }

    static simpleTest()
    {
        new CMaze(3,3).consoleLogMazePixels();
        new CMaze(5,10).consoleLogMazePixels();
    }

    static longTest()
    {
        for (let i = 0; i < 10000; i++)
        {
            const width = randomInt(2, 500);
            const height = randomInt(2, 500);
            new CMaze(width, height);

            if (i % 100 == 0)
            {
                console.log("Finished iteration " + i);
            }
        }
        console.log("Finished long test successfully!");
    }

    static addEntranceAndExitToMazeTest()
    {
        let maze = new CMaze(10, 10);
        maze.addEntranceAndExitToMaze();
        maze.consoleLogMazePixels();
    }
} 

export class CMazeTest {
    static run()
    {
        CMaze.simpleTest();
        CMaze.addEntranceAndExitToMazeTest();
        CMaze.findSolutionPathTest();
        CMaze.findLongestSolutionPathShortTest();
        CMaze.findLongestSolutionPathTest();
        CMaze.longTest();
    }
}