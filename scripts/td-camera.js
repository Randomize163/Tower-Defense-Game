import { assert } from "./td-utils.js";
import { AssetType } from "./td-asset.js"

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
    constructor(ctx, assets, width, height, tilesX, tilesY)
    {
        this.ctx = ctx;
        this.assets = assets;

        this.tilesX = tilesX;
        this.tilesY = tilesY;

        this.pictureOffsetX = 0;
        this.pictureOffsetY = 0;

        this.width = width;
        this.height = height;
        
        this.fitPictureToDisplay(this.width, this.height);
    }

    //
    // ensures, that picture is inside of display or display is inside of picture
    //
    movePicture(offsetX, offsetY)
    {
        this.pictureOffsetX += offsetX;
        this.pictureOffsetY += offsetY;
    }

    coordinateIsOnPicture(mouseX, mouseY)
    {
        if ((mouseX < this.pictureOffsetX) || (mouseX > (this.pictureOffsetX + this.pictureWidth)))
        {
            return false;
        }

        if (((mouseY < this.pictureOffsetY) || (mouseY > (this.pictureOffsetY + this.pictureHeight))))
        {
            return false;
        }

        return true;
    }

    zoom(tileSizeDelta, mouseCoordinatesOnCanvas)
    {
        const [mouseX, mouseY] = mouseCoordinatesOnCanvas;

        this.ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        this.ctx.fillRect(mouseX, mouseY, 10, 10);

        assert(0 <= mouseX && mouseX <= this.width);
        assert(0 <= mouseY && mouseY <= this.height);
        
        if (!this.coordinateIsOnPicture(mouseX, mouseY)) 
        {
            return;
        }

        const tileX = (mouseX - this.pictureOffsetX) / this.tileSize;
        const tileY = (mouseY - this.pictureOffsetY) / this.tileSize;

        const tileSizeToFitWidth = Math.floor(this.width / this.tilesX);
        const tileSizeToFitHeight = Math.floor(this.height / this.tilesY);
        const tileSizeToFitDisplay = Math.min(tileSizeToFitWidth, tileSizeToFitHeight);
        
        // this.tileSize + tileSizeDelta >= tileSizeToFitDisplay 
        // tileSizeDelta >= tileSizeToFitDisplay - this.tileSize
        tileSizeDelta = Math.max(tileSizeDelta, tileSizeToFitDisplay - this.tileSize);
        this.tileSize += tileSizeDelta;

        this.pictureOffsetX = this.pictureOffsetX - tileX * tileSizeDelta;
        this.pictureOffsetY = this.pictureOffsetY - tileY * tileSizeDelta;
    }

    fitPictureToDisplay(width, height)
    {
        this.width = width;
        this.height = height;
        
        const tileSizeToFitWidth = Math.floor(width / this.tilesX);
        const tileSizeToFitHeight = Math.floor(height / this.tilesY);
        const tileSizeToFitDisplay = Math.min(tileSizeToFitWidth, tileSizeToFitHeight);

        this.tileSize = tileSizeToFitDisplay;
        
        this.pictureOffsetX = Math.floor((this.width - this.pictureWidth) / 2);
        this.pictureOffsetY = Math.floor((this.height - this.pictureHeight) / 2);
    }

    get pictureWidth()
    {
        return this.tileSize * this.tilesX;
    }

    get pictureHeight()
    {
        return this.tileSize * this.tilesY;
    }
    
    clear()
    {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawImage(assetType, tileX, tileY, rotation = 0)
    {        
        if (assetType == AssetType.transparentTile)
        {
            return;
        }
        
        const absoluteX = tileX * this.tileSize + this.pictureOffsetX;
        const absoluteY = tileY * this.tileSize + this.pictureOffsetY;
        
        if (absoluteX > this.width) {
            return;
        }

        if (absoluteY > this.height) {
            return;
        }

        const asset = this.assets.getAsset(assetType);

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