import { assert } from "./td-utils.js";

export class Camera
{
    constructor(width, height, tileSize = 64, offsetX = 0, offsetY = 0, maxTilesX, maxTilesY)
    {
        this.maxTilesX = maxTilesX;
        this.maxTilesY = maxTilesY;
        this.update(offsetX, offsetY, width, height, tileSize);
    }

    update(offsetX, offsetY, width, height, tileSize)
    {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.width = width;
        this.height = height;

        this.tileSize = tileSize;

        this.updateDependantMembers();
    }

    updateDependantMembers()
    {
        this.firstTileIndexX = Math.floor(this.offsetX / this.tileSize);
        this.firstTileIndexY = Math.floor(this.offsetY / this.tileSize);

        this.lastTileIndexX = Math.floor((this.offsetX + this.width) / this.tileSize);
        this.lastTileIndexY = Math.floor((this.offsetY + this.height) / this.tileSize);
    }

    changeResolution(width, height)
    {
        this.width = width;
        this.height = height;

        this.updateDependantMembers();
    }

    moveCamera(stepX, stepY)
    {
        assert(false); // Not Impl
    }

    changeTileSize(tileSize)
    {
        const minTileSize = this.width / this.maxTilesX; 
        this.tileSize = Math.max(tileSize, minTileSize);

        this.updateDependantMembers();
    }
}

export class Display
{
    constructor(ctx, assets, width, height, tilesX, tilesY, tileSize)
    {
        this.ctx = ctx;
        this.assets = assets;

        this.tilesX = tilesX;
        this.tilesY = tilesY;

        this.pictureOffsetX = 0;
        this.pictureOffsetY = 0;

        this.width = width;
        this.height = height;

        this.tileSize = tileSize;
    }

    movePicture(offsetX, offsetY)
    {
        this.pictureOffsetX += offsetX;
        this.pictureOffsetY += offsetY;

        if (this.pictureOffsetX >= 0)
        {
            // picture is smaller then display
            // pictureOffsetX + width < tiles * tilesX 
            this.pictureOffsetX = Math.min(this.pictureOffsetX, this.pictureOffsetX + this.tileSize * this.tilesX);
        }
        else
        {
            // picture is bigger then display
            // -pictureOffsetX + width < tiles * tilesX 
            this.pictureOffsetX = Math.max(this.pictureOffsetX, this.width - this.tileSize * this.tilesX);
        }

        if (this.pictureOffsetY >= 0)
        {
            // picture is smaller then display
            this.pictureOffsetY = Math.min(this.pictureOffsetY, this.pictureOffsetY + this.tileSize * this.tilesY);
        } 
        else
        {
            this.pictureOffsetY = Math.max(this.pictureOffsetY, this.pictureOffsetY + this.tileSize * this.tilesY);
        }
    }

    zoom(tileSizeDelta)
    {
        this.tileSize += tileSizeDelta;
    }

    fitPictureToScreen(width, height)
    {
        this.width = width;
        this.height = height;
        
        const tileSizeToFitWidth = Math.floor(width / this.tilesX);
        const tileSizeToFitHeight = Math.floor(height / this.tilesY);
        const tileSizeToFitScreen = Math.min(tileSizeToFitWidth, tileSizeToFitHeight);

        this.tileSize = tileSizeToFitScreen;
        
        const pictureWidth = this.tileSize * this.tilesX;
        const pictureHeight = this.tileSize * this.tilesY;

        this.pictureOffsetX = Math.floor((this.width - pictureWidth) / 2);
        this.pictureOffsetY = Math.floor((this.height - pictureHeight) / 2);
    }

    drawImage(assetType, tileX, tileY, rotation = 0)
    {
        const asset = this.assets.getAsset(assetType);

        const absoluteX = tileX * this.tileSize + this.pictureOffsetX;
        const absoluteY = tileY * this.tileSize + this.pictureOffsetY;
        
        if (absoluteX > this.width)
        {
            return;
        }

        if (absoluteY > this.height)
        {
            return;
        }

        if (rotation != 0)
        {   
            ctx.save();
            ctx.translate(absoluteX, absoluteY);
            ctx.rotate(rotation);
            this.ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize);  
            ctx.restore();
        }
        else
        {
            this.ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, absoluteX, absoluteY, this.tileSize, this.tileSize);  
        }
    }
}