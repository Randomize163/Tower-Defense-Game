import { IGameObject } from "./td-gameobject.js";
import { CircleCollider } from "./td-collider.js";
import { assert, distance, equalsFloats } from "./td-utils.js";

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

        this.destinationDistanceThreshold = 0.2;
    }

    setPath(path)
    {
        this.path = path;
        this.nextPathPointIndex = 1;
    }

    getNextPosition(deltaTime)
    {
        assert(this.path.length > 0);
        
        const [destX, destY] = this.path[this.nextPathPointIndex];
        const dx = destX + 0.5 - this.tilesX;
        const dy = destY + 0.5 - this.tilesY;
        const angle = Math.atan2(dy, dx);

        const step = deltaTime * this.speed;
        const stepX = step * Math.cos(angle);
        const stepY = step * Math.sin(angle);

        const nextPosition = {};
        nextPosition.x = this.tilesX + stepX;
        nextPosition.y = this.tilesY + stepY;
        nextPosition.rotation = angle;

        return nextPosition;
    }

    calculate(deltaTime)
    {
        if (this.finishedPath)
        {
            return;
        }

        let {x, y, rotation} = this.getNextPosition(deltaTime);
        this.tilesX = x;
        this.tilesY = y;
        this.rotation = rotation;

        const [destX, destY] = this.path[this.nextPathPointIndex];
        if (distance(this.tilesX, this.tilesY, destX + 0.5, destY + 0.5) < this.destinationDistanceThreshold)
        {
            this.nextPathPointIndex++;
        }

        if (this.nextPathPointIndex == this.path.length)
        {
            this.finishedPath = true;
            console.log("Enemy finished path");
        }
    }

    display(ctx, assets, camera)
    {
        const asset = assets.getAsset(this.assetType);
        ctx.save();
        ctx.translate(this.tilesX * camera.tileSize, this.tilesY * camera.tileSize);
        ctx.rotate(this.rotation);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -camera.tileSize/2, -camera.tileSize/2, camera.tileSize, camera.tileSize);  
        ctx.restore();
    }
}