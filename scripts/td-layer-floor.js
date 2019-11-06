import {ILayer} from './td-layer.js';
import {CMaze} from './td-maze.js';
import { AssetType, CKenneyAssetsCollection } from './td-asset.js';
import { getNeighboursCoordinates, randomBoolWithProbability, sleep } from './td-utils.js';
import { Camera } from './td-camera.js';

export class CRandomFloorLayer extends ILayer
{
    constructor(width, height, params = {'towerTilesFillFactor':0.6})
    {
        super(width, height);
        this.addRandomPath();
        this.addRandomTowerTiles(params.towerTilesFillFactor);
    }
    
    addRandomPath()
    {
        let maze = new CMaze(this.width, this.height);
        maze.addEntranceAndExitToMaze();
    
        this.tilesMap = Array.from(Array(maze.width), () => new Array(maze.height).fill(AssetType.emptyTile));
        this.width = maze.width;
        this.height = maze.height;

        this.path = maze.findLongestSolutionPath(false);
        this.path.forEach(([x,y]) => {this.tilesMap[x][y] = AssetType.roadTile});

        this.begin = this.path[0];
        this.end = this.path[this.path.length - 1]; 
    }

    addRandomTowerTiles(fillFactor)
    {
        for (let i = 0; i < this.tilesMap.length; i++)
        {
            for (let j = 0; j < this.tilesMap[0].length; j++)
            {
                if (this.tilesMap[i][j] != AssetType.emptyTile) {
                    continue;
                }

                const neighbours = getNeighboursCoordinates(i, j, this.tilesMap.length, this.tilesMap[0].length);
                const isCloseToPath = neighbours.some(
                    ([x, y]) =>
                    {
                        return this.tilesMap[x][y] == AssetType.roadTile;
                    }
                );

                if (!isCloseToPath) {
                   continue;
                }
                    
                if (randomBoolWithProbability(fillFactor))
                {
                    this.tilesMap[i][j] = AssetType.towerTile;
                }
            }
        }
    }

    static generateFloorTest()
    {
        let map = new CFloorLayer(3,3);
        console.log(map);
    }

    static async drawFloorLayerTest()
    {
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let layer = new CFloorLayer(3,5);
        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        layer.display(ctx, tiles, camera);
        await sleep(1000);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}    

export class CFloorLayerTest 
{
    static async run()
    {
        CFloorLayer.generateFloorTest();
        await CFloorLayer.drawFloorLayerTest();
    }
}