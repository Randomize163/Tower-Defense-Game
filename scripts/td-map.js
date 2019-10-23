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
        let startPosition = [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)];
        
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
            let selectedNext = nexts[Math.floor(Math.random() * nexts.length)];
            
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

    mazePixelsToString()
    {
        let maze = "";
        for (let i = 0; i < this.mazePixels.length; i++) 
        {
            for (let j = 0; j < this.mazePixels[0].length; j++)
            {
                switch (this.mazePixels[i][j])
                {
                    case TilesType.empty:
                        maze += "▇";
                        break;
                    case TilesType.path:
                        maze += "　";
                        break;
                    default:
                        console.error("Unprintable tile type: " + this.mazePixels[i][j]);
                        debugger;
                }
            }

            maze += "\n";
        }

        return maze;
    }

    consoleLogmazePixels()
    {
        console.log("Print Maze (width: " + this.mazePixels.length + ", length: " + this.mazePixels[0].length + "):");
        console.log(this.mazePixelsToString());
    }

    printmazePixelsToHtml(elementId)
    {
        let outputElement = document.getElementById(elementId);
        outputElement.innerHTML = this.mazePixelsToString();
    }

    static simpleTest()
    {
        new CMaze(3,3).consoleLogmazePixels();
        new CMaze(5,10).consoleLogmazePixels();
    }

    static longTest()
    {
        for (let i = 0; i < 10000; i++)
        {
            const width = 2 + Math.floor(Math.random() * 500);
            const height = 2 + Math.floor(Math.random() * 500);
            new CMaze(width, height);

            if (i % 100 == 0)
            {
                console.log("Finished iteration " + i);
            }
        }
        console.log("Finished long test successfully!");
    }
} 

export class CMapTest {
    static run()
    {
        CMaze.simpleTest();
        CMaze.longTest();
    }
}