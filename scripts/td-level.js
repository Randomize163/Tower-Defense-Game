import { assert } from "./td-utils.js";

export class ILevel 
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;

        this.layers = [];
    }

    display(displayObj)
    {
        assert(this.layers.length > 0);
        this.layers.forEach((layer) => layer.display(displayObj));
    }
}