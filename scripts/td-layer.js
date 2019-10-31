import { AssetType } from "./td-asset.js";

export class ILayer
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;

        this.tilesMap = Array.from(Array(width), () => new Array(height).fill(AssetType.transparentTile));
    }

    //
    // draw() - ctx is a canvas.getContext('2d'); tiles is an instance of IAssetCollection
    //
    draw(ctx, tiles, fromi = 0, fromj = 0, maxi = this.tilesMap.length, maxj = this.tilesMap[0].length, fromdx = 0, fromdy = 0, dTileSize = 64)
    {
        let dy = fromdy;
        for (let i = fromi; i < maxi; i++)
        {
            let dx = fromdx;
            for (let j = fromj; j < maxj; j++)
            {
                if (this.tilesMap[i][j] != AssetType.transparentTile)
                {
                    const asset = tiles.getAsset(this.tilesMap[i][j]);
                    ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, dx, dy, dTileSize, dTileSize);  
                }
                dx += dTileSize;
            }
            dy += dTileSize;
        }
    }
}