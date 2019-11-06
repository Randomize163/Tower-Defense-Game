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
        this.destinationDistanceThreshold = 0.2;
    }

    calculate(deltaTime)
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.timeToLive < 0 || this.enemy.destroyed)
        {
            this.destroy();
            return;
        }
        
        this.timeToLive -= deltaTime;

        let {x, y, rotation} = this.getNextPosition(deltaTime);
        this.tilesX = x;
        this.tilesY = y;
        this.rotation = rotation;

        if (this.distanceToEnemy() < this.destinationDistanceThreshold)
        {
            this.enemy.hit(this.damage);
            this.destroy();
        }
    }

    distanceToEnemy()
    {
        return distance(this.tilesX, this.tilesY, this.enemy.tilesX, this.enemy.tilesY);
    }

    getNextPosition(deltaTime)
    {
        const [destX, destY] = [this.enemy.tilesX, this.enemy.tilesY];
        const dx = destX - this.tilesX;
        const dy = destY - this.tilesY;
        const angle = Math.atan2(dy, dx);

        const step = Math.min(deltaTime * this.speed, this.distanceToEnemy());
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
    constructor(tilesX, tilesY, aimAlgo)
    {
        super();
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.rotate = 0;

        this.aimAlgorithm = aimAlgo;
        this.rockets = [];

        this.upgradeOptions = new Map([
            [
                UpgradeOptions.damage, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 20,
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
                    "currentValue": 500,
                } 
            ],
            [
                UpgradeOptions.rocketSpeed, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 0.005,
                } 
            ],
        ]);
        
        this.currentTarget = null;
        this.reloadTimeLeft = this.reloadTime;

        this.rocketTimeToLive = 5000;
    }

    get damage()
    {
        return this.upgradeOptions.get(UpgradeOptions.damage).currentValue;
    }

    get rocketSpeed()
    {
        return this.upgradeOptions.get(UpgradeOptions.rocketSpeed).currentValue;
    }

    get reloadTime()
    {
        return this.upgradeOptions.get(UpgradeOptions.reloadTime).currentValue;
    }

    calculate(deltaTime, enemies) {   
        if (!this.currentTarget)
        {
            const targets = this.aimAlgorithm.getSortedTargets(enemies, this);
            this.currentTarget = targets.length == 0 ? null : targets[0];
        }

        this.aim(this.currentTarget);

        if (this.reloadTimeLeft <= 0 && this.currentTarget) 
        {
            this.shoot(this.currentTarget);
            this.currentTarget = null;
            this.reloadTimeLeft = this.reloadTime;
        }
        else
        {
            this.reloadTimeLeft -= deltaTime;
        }

        this.calculateRockets(deltaTime);
    }

    calculateRockets(deltaTime)
    {
        const rockets = [];
        this.rockets.forEach((rocket) => {
            rocket.calculate(deltaTime);
            if (!rocket.destroyed)
            {
                rockets.push(rocket);
            }
        });

        this.rockets = rockets;
    }

    shoot(enemy)
    {
        const rocket = new CBullet(enemy, this.damage, this.rocketSpeed, this.rocketTimeToLive, this.tilesX + 0.5, this.tilesY + 0.5, AssetType.smallRocket);
        this.rockets.push(rocket);
    }

    aim(enemy)
    {
        if (!this.currentTarget) return;
        const dx = enemy.tilesX - this.tilesX - 0.5;
        const dy = enemy.tilesY - this.tilesY - 0.5;
        this.rotation = Math.atan2(dy, dx);
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
        const x = this.tilesX * camera.tileSize - camera.offsetX;
        const y = this.tilesY * camera.tileSize - camera.offsetY;

        const asset = assets.getAsset(AssetType.rocketTowerBase);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, x, y, camera.tileSize, camera.tileSize);  
    }

    displayHead(ctx, assets, camera)
    {
        const x = (this.tilesX + 0.5) * camera.tileSize - camera.offsetX;
        const y = (this.tilesY + 0.5) * camera.tileSize - camera.offsetY;

        const asset = assets.getAsset(AssetType.rocketTowerHead);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, -camera.tileSize/2, -camera.tileSize/2, camera.tileSize, camera.tileSize);  
        ctx.restore();
    }

    displayRockets(ctx, assets, camera) {
        this.rockets.forEach(rocket => rocket.display(ctx, assets, camera));
    }
}