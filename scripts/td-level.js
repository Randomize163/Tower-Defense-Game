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
    // display() - ctx is a canvas.getContext('2d'); tiles is an instance of IAssetCollection
    // ctx, tiles, camera
    //
    display(...args)
    {
        assert(this.layers.length > 0);
        this.layers.forEach((layer) => layer.display(...args));
    }
}