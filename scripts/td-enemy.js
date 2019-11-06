import { IGameObject } from "./td-gameobject.js";
import { CircleCollider } from "./td-collider.js";
import { assert, distance, equalsFloats } from "./td-utils.js";

export class CEnemy extends IGameObject
{
    constructor(x, y, rotation, speed, hp, killBonus, radius, assetType)
    {
        super();
        this.maxHp = hp 
        this.hp = hp;
        this.speed = speed;
        this.killBonus = killBonus;
        this.tilesX = x;
        this.tilesY = y;
        this.collider = new CircleCollider(this, radius);
        this.rotation = rotation;
        this.assetType = assetType;

        // Pathfinding parameters:
        this.destinationDistanceThreshold = 0.2;

        // Healthbar parameters:
        this.barShiftYCoef = 0.3;
        this.barLengthXCoef = 0.5;
        this.barWidthCoef = 0.08;
        this.healthBarStrokeWidth = 1;
        this.healthBarStrokeStyle = 'black';
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
        if (this.destroyed)
        {
            return;
        }

        if (this.finishedPath)
        {
            this.destroy();
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

    destroy()
    {
        this.destroyed = true;
    }

    displayModel(ctx, assets, camera)
    {
        const asset = assets.getAsset(this.assetType);
        ctx.save();
        ctx.translate(this.tilesX * camera.tileSize, this.tilesY * camera.tileSize);
        ctx.rotate(this.rotation);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -camera.tileSize/2, -camera.tileSize/2, camera.tileSize, camera.tileSize);  
        ctx.restore();
    }

    displayHealh(ctx, assets, camera)
    {
        if (!this.gotHit())
        {
            //return;
        }

        const barLengthX = camera.tileSize * this.barLengthXCoef;
        const barWidthY = camera.tileSize * this.barWidthCoef;

        const barShiftY = -camera.tileSize * this.barShiftYCoef;

        const x = this.tilesX * camera.tileSize - barLengthX/2;
        const y = this.tilesY * camera.tileSize + barShiftY;

        // display health bar
        const healthLengthX = this.hp/this.maxHp * barLengthX; 
        ctx.fillStyle = this.getHealthFillStyle();
        ctx.fillRect(x, y, healthLengthX, barWidthY);

        // display frame
        ctx.strokeStyle = this.healthBarStrokeStyle;
        ctx.lineWidth = this.healthBarStrokeWidth;
        ctx.strokeRect(x, y, barLengthX, barWidthY);

    }

    getHealthFillStyle()
    {
        if (this.hp/this.maxHp < 0.40)
        {
            return 'rgba(255, 0, 0, 1)'; // red
        }

        if (this.hp/this.maxHp < 0.70)
        {
            return 'rgba(255, 255, 0, 1)'; // yellow
        }

        return 'rgba(0, 255, 0, 1)'; // light green
    }

    gotHit()
    {
        return this.hp < this.maxHp;
    }

    display(ctx, assets, camera)
    {
        if (this.destroyed)
        {
            return;
        }

        this.displayModel(ctx, assets, camera);
        this.displayHealh(ctx, assets, camera);
    }

    hit(damage)
    {
        if (this.hp <= damage)
        {
            this.hp = 0;
            this.destroy();
            return;
        }

        this.hp -= damage;
    }
}