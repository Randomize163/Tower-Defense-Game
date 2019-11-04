import { IGameObject } from "./td-gameobject.js";
import { CircleCollider } from "./td-collider.js";

export class CEnemy extends IGameObject
{
    constructor(x, y, rotation, speed, hp, killBonus, radius, assetType)
    {
        super();
        this.hp = hp;
        this.speed = speed;
        this.killBonus = killBonus;
        this.tilesX = x;
        this.tilesY = y;
        this.collider = new CircleCollider(this, radius);
        this.rotation = rotation;
        this.assetType = assetType;
    }

    setPath(path)
    {
        this.path = path;
    }

    getNextPosition(deltaTime)
    {}

    calculate(deltaTime)
    {
        let nextPosition = this.getNextPosition(deltaTime);
        this.tilesX = nextPosition.x;
        this.tilesY = nextPosition.y;
        this.rotation = nextPosition.rotation;
    }

    display(ctx, assets, camera)
    {
        const asset = assets.getAsset(this.assetType);
        ctx.save();
        ctx.translate(this.tilesX * camera.tileSize, this.tilesY * camera.tileSize);
        ctx.rotate(-this.rotation * Math.PI/180);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -camera.tileSize/2, -camera.tileSize/2, camera.tileSize, camera.tileSize);  
        ctx.restore();
    }
}