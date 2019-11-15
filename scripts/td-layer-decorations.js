import {ILayer} from './td-layer.js';
import {randomChoice, sleep} from './td-utils.js';
import {AssetType, CKenneyAssetsCollection} from './td-asset.js';

const decorationsFillFactorDefault = 
[
    {   
        'value':AssetType.stone2Tile, 
        'prob':0.1,
    },
    {   
        'value':AssetType.bush1Tile, 
        'prob':0.2,
    },
    {   
        'value':AssetType.bush3Tile, 
        'prob':0.1,
    },
    {   
        'value':AssetType.emptyTile, 
        'prob':0.6,
    },
];

export class CRandomDecorationsLayer extends ILayer
{
    constructor(width, height, floorLayer, params)
    {
        super(width, height);
        this.generateRandomDecorations(floorLayer, params.fillFactors)
        this.addBeginAndEndDecorations(floorLayer);
    }

    generateRandomDecorations(floorLayer, fillFactors = decorationsFillFactorDefault)
    {
        for (let i = 0; i < this.tilesMap.length; i++)
        {
            for (let j = 0; j < this.tilesMap[0].length; j++)
            {
                if (floorLayer.tilesMap[i][j] != AssetType.emptyTile)
                {
                    continue;
                }

                const decoration = randomChoice(fillFactors);  
                this.tilesMap[i][j] = decoration;
            }
        }
    }

    addBeginAndEndDecorations(floorLayer)
    {
        let [x,y] = floorLayer.begin;
        this.tilesMap[x][y] = AssetType.beginTile;
        
        [x,y] = floorLayer.end;
        this.tilesMap[x][y] = AssetType.endTile;
    }

    static async generateDecorationsLayerTest()
    {
        let emptyLayer = new ILayer(5,5);
        let decoration = new CDecorationsLayer(5,5);
        decoration.generateRandomDecorations(emptyLayer);

        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        decoration.display(ctx, tiles, camera);
        await sleep(1000);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

export class CDecorationsLayerTest 
{
    static async run()
    {
        await CDecorationsLayer.generateDecorationsLayerTest();
    }
}