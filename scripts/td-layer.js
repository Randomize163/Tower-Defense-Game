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
    display(ctx, assets, camera)
    {
        const lastTileIndexX = Math.min(camera.lastTileIndexX, this.width - 1);
        const lastTileIndexY = Math.min(camera.lastTileIndexY, this.height - 1);

        let dy = camera.firstTileIndexY * camera.tileSize;
        for (let i = camera.firstTileIndexX; i <= lastTileIndexX; i++)
        {
            let dx = camera.firstTileIndexX * camera.tileSize;
            for (let j = camera.firstTileIndexY; j <= lastTileIndexY; j++)
            {
                if (this.tilesMap[i][j] != AssetType.transparentTile)
                {
                    const asset = assets.getAsset(this.tilesMap[i][j]);
                    ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, dx, dy, camera.tileSize, camera.tileSize);  
                }
                dx += camera.tileSize;
            }
            dy += camera.tileSize;
        }
    }
}