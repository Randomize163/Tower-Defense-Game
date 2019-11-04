export class Camera
{
    constructor(width, height, tileSize = 64, offsetX = 0, offsetY = 0)
    {
        this.update(offsetX, offsetY, width, height, tileSize);
    }

    update(offsetX, offsetY, width, height, tileSize)
    {
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.width = width;
        this.height = height;

        this.tileSize = tileSize;

        this.firstTileIndexX = Math.floor(this.offsetX / this.tileSize);
        this.firstTileIndexY = Math.floor(this.offsetY / this.tileSize);

        this.lastTileIndexX = Math.floor((this.offsetX + this.width) / this.tileSize);
        this.lastTileIndexY = Math.floor((this.offsetY + this.height) / this.tileSize);
    }
}