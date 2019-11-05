import { IGameObject } from "./td-gameobject.js";
import { AssetType } from "./td-asset.js";
import { CTargetSelectNoSort } from "./td-target-select-algorithm.js";
import { distance } from "./td-utils.js";

export const UpgradeOptions = Object.freeze(
{
    "damage": 0,
    "range": 1,
    "reloadTime": 2,
    "rocketSpeed": 3,
});
 
export class ITower extends IGameObject
{
    tileX;
    tileY;
    cost;
    aimAlgorithm;
    upgradeOptions;

    //
    // upgradeOptions = {{upgradeType, cost, currentLevel, maxLevel}}
    //
    getUpgradeOptions() {}
    
    upgrade(upgradeType) {}

    setAimAlgorithm(aimAlgorithm) {}

    get range()
    {
        return this.upgradeOptions.get(UpgradeOptions.range).currentValue;
    }
}

export class CBullet extends IGameObject
{
    constructor(targetEnemy, damage, speed, timeToLive, tilesX, tilesY, assetType)
    {
        super();
        this.enemy = targetEnemy;
        this.damage = damage;
        this.timeToLive = timeToLive;
        this.speed = speed;
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.assetType = assetType;

        // Parameters:
        this.destinationDistanceThreshold = 0.1;
    }

    calculate(deltaTime)
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.timeToLive < 0)
        {
            this.destroy();
            return;
        }
        
        this.timeToLive -= deltaTime;

        let {x, y, rotation} = this.getNextPosition(deltaTime);
        this.tilesX = x;
        this.tilesY = y;
        this.rotation = rotation;

        if (distance(this.tilesX, this.tilesY, this.enemy.tilesX, this.enemy.tilesY) < this.destinationDistanceThreshold)
        {
            this.enemy.hit(this.damage);
            this.destroy();
        }

        
    }

    getNextPosition(deltaTime)
    {
        const [destX, destY] = [this.enemy.tilesX, this.enemy.tilesY];
        const dx = destX - this.tilesX;
        const dy = destY - this.tilesY;
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

    destroy()
    {
        this.destroyed = true;  
        console.log("Bullet finished");
    }

    display(ctx, assets, camera)
    {
        if (this.destroyed) {
            return;
        }

        const asset = assets.getAsset(this.assetType);
        ctx.save();
        ctx.translate(this.tilesX * camera.tileSize, this.tilesY * camera.tileSize);
        ctx.rotate(this.rotation);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -camera.tileSize/2, -camera.tileSize/2, camera.tileSize, camera.tileSize);  
        ctx.restore();
    }
}

export class CRocketTower extends ITower
{
    constructor(tileX, tileY, aimAlgo)
    {
        super();
        this.tileX = tileX;
        this.tileY = tileY;

        this.aimAlgorithm = new CTargetSelectNoSort();

        this.upgradeOptions = new Map([
            [
                UpgradeOptions.damage, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 10,
                }
            ],
            [
                UpgradeOptions.range, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 3,
                }
            ],
            [
                UpgradeOptions.reloadTime, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 1000,
                } 
            ],
            [
                UpgradeOptions.rocketSpeed, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 5,
                } 
            ],
        ]);
    
        this.currentTarget = null;
    }

    calculate(enemies) {   
        if (!this.currentTarget)
        {
            this.currentTarget = selectTarget(enemies);
        }

        aim(this.currentTarget);

        if (!currentCooldown) 
        {
            this.shoot(this.currentTarget);
        }
    }

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