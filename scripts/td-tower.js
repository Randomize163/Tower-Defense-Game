import { IGameObject } from "./td-gameobject.js";
import { AssetType } from "./td-asset.js";

export class ITower extends IGameObject
{
    upgrade() {}
}

export class RocketTower extends ITower
{
    constructor(tileX, tileY)
    {
        super();
        this.tileX = tileX;
        this.tileY = tileY;
    }

    calculate() {}

    upgrade() {}

    display(ctx, assets, camera) 
    {
        this.displayBase(ctx, assets, camera);
        this.displayHead(ctx, assets, camera);
        this.displayRockets(ctx, assets, camera);
    }

    displayBase(ctx, assets, camera)
    {
        const x = this.tileX * camera.tileSize - camera.offsetX;
        const y = this.tileY * camera.tileSize - camera.offsetY;

        const asset = assets.getAsset(AssetType.rocketTowerBase);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, x, y, camera.tileSize, camera.tileSize);  
    }

    displayHead(ctx, assets, camera)
    {
        const x = this.tileX * camera.tileSize - camera.offsetX;
        const y = this.tileY * camera.tileSize - camera.offsetY;

        //TODO: use rotation

        const asset = assets.getAsset(AssetType.rocketTowerHead);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, x, y, camera.tileSize, camera.tileSize);  
    }

    displayRockets(ctx, assets, camera) {}
}