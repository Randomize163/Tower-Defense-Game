const TilesType = Object.freeze(
    {
        "empty":1, 
        "path":0, 
        "build":2,
        "spawn":3,
        "base":4
    });

const WallsType = Object.freeze(
    {
        "left":0x1000, 
        "right":0x0100, 
        "up":0x0010,
        "down":0x0001,
        "all":0x1111
    });
        
class CMapGenerator 
{
    constructor()
    {

    }

    generateMap(algorithm, ...args)
    {
        switch (algorithm)
        {
            case "maze":
                return generateMapMaze(args);
            case "simple":
                return generateMapSimple(args);
        }
    }

    generateMapMaze(width, height)
    {

    }

    generateMapSimple(width, height)
    {
        console.log("Simple algorithm is not supported yet.");
        debugger;
    }
}

class Stack 
{
    constructor()
    {
        this.arr = [];
    }

    push(elem)
    {
        this.arr.push(elem);
    }

    pop()
    {
        return this.arr.pop();
    }

    top()
    {
        if (this.arr.length == 0)
        {
            throw new Error('Stack is empty!');
        }
        
        return this.arr[this.arr.length - 1];
    }

    size()
    {
        return this.arr.length;
    }

    isEmpty()
    {
        return this.size() == 0;
    }
}

class CMazeGenerator 
{
    generateMaze(width, height)
    {
        let maze = Array.from(Array(width), () => new Array(height));
        for (let i = 0; i < maze.length; i++)
        {
            for (let j = 0; j < maze[0].length; j++)
            {
                maze[i][j] = {
                    "tileType": TilesType.empty,
                    "visited": false,
                    "walls": WallsType.all
                };
            }
        }

        let stack = new Stack();
        let visited = 0;
        let startPosition = [Math.floor(Math.random()*width), Math.floor(Math.random()*height)];
        
        stack.push(startPosition);

        for (;;)
        {
            if (stack.isEmpty())
            {
                break;
            }

            let [currentX, currentY] = stack.top();
            maze[currentX][currentY].visited = true;
            
            // find potential nexts
            let nexts = [];
    
            if (currentX + 1 < maze.length && maze[currentX + 1][currentY].visited == false)
            {
                nexts.push({
                    "position": [currentX + 1, currentY],
                    "direction": 'right',
                    "breakWallForNext": 'left'
                });
            }
            
            if (currentX - 1 >= 0 && maze[currentX - 1][currentY].visited == false)
            {
                nexts.push({
                    "position": [currentX - 1, currentY],
                    "direction": 'left',
                    "breakWallForNext": 'right'
                });
            }
            
            if (currentY + 1 < maze[0].length && maze[currentX][currentY + 1].visited == false)
            {
                nexts.push({
                    "position": [currentX, currentY + 1],
                    "direction": 'up',
                    "breakWallForNext": 'down'
                });
            }
            
            if (currentY - 1 >= 0 && maze[currentX][currentY - 1].visited == false)
            {
                nexts.push({
                    "position": [currentX, currentY - 1],
                    "direction": 'down',
                    "breakWallForNext": 'up'
                });
            }
            
            if (nexts.length == 0)
            {
                stack.pop();
                continue;
            }

            // choose next
            let next = nexts[Math.floor(Math.random() * nexts.length)];
            
            // break the wall
            let [nextX, nextY] = next.position;
            maze[nextX][nextY].walls       &= ~WallsType[next.breakWallForNext];
            maze[currentX][currentY].walls &= ~WallsType[next.direction];

            // go to next
            stack.push(next.position);
        }

        return maze;
    }

    transformMazeToPixels(maze)
    {
        let result = Array.from({length: maze.length * 4 + 1}, e => Array(maze[0].length * 4 + 1).fill(TilesType.path));         

        for (let i = 0; i < maze.length; i++)
        {
            for (let j = 0; j < maze[0].length; j++)
            {
                this.transformTileToPixels(result, i, j, maze[i][j]);
            }
        }

        return result;
    }

    transformTileToPixels(result, i, j, tile)
    {
        let [pixelTileCenterX, pixelTileCenterY] = [2 + 4*i, 2 + 4*j];

        if ((tile.walls & WallsType.left) != 0)
        {
            result[pixelTileCenterX - 2][pixelTileCenterY]     = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY - 1] = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY - 2] = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY + 1] = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY + 2] = TilesType.empty;
        }

        if ((tile.walls & WallsType.right) != 0)
        {
            result[pixelTileCenterX + 2][pixelTileCenterY]     = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY - 1] = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY + 1] = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY - 2] = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY + 2] = TilesType.empty;
        }

        if ((tile.walls & WallsType.up) != 0)
        {
            result[pixelTileCenterX][pixelTileCenterY + 2]     = TilesType.empty;
            result[pixelTileCenterX + 1][pixelTileCenterY + 2] = TilesType.empty;
            result[pixelTileCenterX - 1][pixelTileCenterY + 2] = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY + 2] = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY + 2] = TilesType.empty;
        }

        if ((tile.walls & WallsType.down) != 0)
        {
            result[pixelTileCenterX][pixelTileCenterY - 2]     = TilesType.empty;
            result[pixelTileCenterX + 1][pixelTileCenterY - 2] = TilesType.empty;
            result[pixelTileCenterX - 1][pixelTileCenterY - 2] = TilesType.empty;
            result[pixelTileCenterX + 2][pixelTileCenterY - 2] = TilesType.empty;
            result[pixelTileCenterX - 2][pixelTileCenterY - 2] = TilesType.empty;
        }

        return result;
    }

    generatePixelMaze(width, height)
    {
        return this.transformMazeToPixels(this.generateMaze(width, height))
    }

    static test()
    {
        const mazeGenerator = new CMazeGenerator();
        console.log(mazeGenerator.generateMaze(5,5));
        console.log(mazeGenerator.generateMaze(50,50));
        console.log(mazeGenerator.generateMaze(500,500));
        //console.log(mazeGenerator.generateMaze(5000,5000));
        console.log(mazeGenerator.generatePixelMaze(5,5));  
    }
}

class CMapTest {
    static run()
    {
        CMazeGenerator.test();
    }
}