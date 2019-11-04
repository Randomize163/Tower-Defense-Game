
import { CFloorLayer } from "./td-layer-floor.js";
import { CDecorationsLayer } from "./td-layer-decorations.js";
import { CKenneyAssetsCollection } from "./td-asset.js";
import { ILevel } from "./td-level.js";
import { sleep } from "./td-utils.js";
import { Camera } from "./td-camera.js";

export class CRandomLevel extends ILevel
{
    constructor(width, height)
    {
        super(width, height);

        let floor = new CFloorLayer(width, height);
        this.width = floor.width;
        this.height = floor.height;

        let decorations = new CDecorationsLayer(this.width, this.height);
        decorations.generateRandomDecorations(floor);
        decorations.addBeginAndEndDecorations(floor);
        
        this.layers.push(floor);
        this.layers.push(decorations);
    }

    getPath()
    {
        return this.layers[0].path;
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

