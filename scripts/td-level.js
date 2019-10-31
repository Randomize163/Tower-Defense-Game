import { assert } from "./td-utils.js";

export class ILevel 
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;

        this.layers = [];
    }

    //
    // draw() - ctx is a canvas.getContext('2d'); tiles is an instance of IAssetCollection
    // ctx, tiles, fromi = 0, fromj = 0, maxi = this.width, maxj = this.height, fromdx = 0, fromdy = 0, dTileSize = 64 
    //
    draw(...args)
    {
        assert(this.layers.length > 0);
        this.layers.forEach((layer) => layer.draw(...args));
    }
}