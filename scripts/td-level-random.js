
import { CRandomFloorLayer } from "./td-layer-floor.js";
import { CRandomDecorationsLayer } from "./td-layer-decorations.js";
import { CKenneyAssetsCollection, AssetType } from "./td-asset.js";
import { ILevel } from "./td-level.js";
import { sleep } from "./td-utils.js";
import { Camera } from "./td-camera.js";

export class CRandomLevel extends ILevel
{
    constructor(params)
    {
        super(params.width, params.height);

        let floor = new CRandomFloorLayer(params.width, params.height, params.floorParams);
        this.width = floor.width;
        this.height = floor.height;

        let decorations = new CRandomDecorationsLayer(this.width, this.height, floor, params.decorationsParams);

        this.layers.push(floor);
        this.layers.push(decorations);
    }

    getPath()
    {
        return this.layers[0].path;
    }

    isPossibleToBuildOnTile(tileX, tileY)
    {
        return this.layers[0].tilesMap[tileX][tileY] == AssetType.towerTile;
    }

    getBegin()
    {
        return this.layers[0].begin;
    }

    //
    // Tests
    //

    static simpleTest()
    {
        let level = new CRandomLevel(5,5);
        console.log(level);
    }

    static async drawTest()
    {
        let tiles = new CKenneyAssetsCollection();
        await tiles.initialize();

        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');

        let level = new CRandomLevel(3,3);

        const camera = new Camera(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        level.display(ctx, tiles, camera);
        await sleep(1000);

        //ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

export class CRandomLevelTest
{
    static async run()
    {
        await CRandomLevel.drawTest();
    }
}

