import { AssetType } from "./td-asset.js";
import { IDisplayable } from "./td-displayable.js";

export class ILayer extends IDisplayable
{
    constructor(width, height)
    {
        super();

        this.width = width;
        this.height = height;

        this.tilesMap = Array.from(Array(width), () => new Array(height).fill(AssetType.transparentTile));
    }

    //
    // overrides IDisplayable::display
    //
    display(displayObj)
    {
        for (let i = 0; i < this.tilesMap.length; i++)
        {
            for (let j = 0; j < this.tilesMap[0].length; j++)
            {
                displayObj.drawImage(this.tilesMap[i][j], i, j);
            }
        }
    }
}