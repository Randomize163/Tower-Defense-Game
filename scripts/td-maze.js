import {Stack, randomInt, assert, getNeighboursCoordinates} from './td-utils.js';

const TilesType = Object.freeze(
{
    "empty":0, 
    "path":1, 
    "build":4,
    "spawn":2,
    "base":3,
    "solution":35,
    "removedPath":36,
});

const WallsType = Object.freeze(
{
    "left":0x1000, 
    "right":0x0100, 
    "up":0x0010,
    "down":0x0001,
    "all":0x1111
});  

export class CMaze
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
                        maze += "???";//"#";
                        break;
                    case TilesType.path:
                        maze += "???";//" ";
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
            let neighbours = getNeighboursCoordinates(currentX, currentY, this.mazePixels.length, this.mazePixels[0].length);
            
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
        for (let i = 0; i < 1000; i++)
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