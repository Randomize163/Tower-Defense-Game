import { AssetType } from './td-asset.js' 
import { CTower } from './td-tower.js'

export const TowerType = Object.freeze(
{
    "rocketTower":0,
    "gunTower":1
});

export const UpgradeOptions = Object.freeze(
    {
        "damage": 0,
        "range": 1,
        "reloadTime": 2,
        "rocketSpeed": 3,
    });

class ITowerFactory
{
    getBuildTowerOptions() {}

    createTower(towerType, towerParams = null) {}
}

export class CTowerFactory
{
    constructor()
    {
        this.rocketTowerUpgradeOptionsMap = this.getRocketTowerUpgradeOptionsMap();
        this.gunTowerUpgradeOptionsMap = this.getGunTowerUpgradeOptionsMap();
        this.buildTowerOptions = new Map([
            [
                TowerType.gunTower,
                {
                    'name':'Gun Tower',
                    'price':10,
                    'layers': [
                        AssetType.gunTowerBase,
                        AssetType.gunTowerHead,
                    ],
                    'type':TowerType.gunBullet,
                    'upgradeOptionsMap': this.getGunTowerUpgradeOptionsMap,             
                },
            ],
            [
                TowerType.rocketTower,
                {
                    'name':'Rocket Tower',
                    'price':20,
                    'layers': [
                        AssetType.rocketTowerBase,
                        AssetType.rocketTowerHeadOneRocket,
                    ],
                    'type':TowerType.rocketTower,
                    'upgradeOptionsMap': this.rocketTowerUpgradeOptionsMap,             
                },
            ],
        ]);
    }

    getRocketTowerUpgradeOptionsMap()
    {
        return new Map([
            [
                UpgradeOptions.damage, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 50,
                }
            ],
            [
                UpgradeOptions.range, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 5,
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
                    "currentValue": 0.005,
                } 
            ],
        ]);
    }

    getGunTowerUpgradeOptionsMap()
    {
        return new Map([
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
                    "currentValue": 300,
                } 
            ],
            [
                UpgradeOptions.rocketSpeed, 
                {
                    "cost": 50,
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "currentValue": 0.03,
                } 
            ],
        ]);
    }

    getBuildTowerOptions() {
        return this.buildTowerOptions;
    }

    createTower(towerType) 
    {
        switch (towerType)
        {
            case TowerType.rocketTower:
                return new CTower(this.getRocketTowerUpgradeOptionsMap(), AssetType.rocketTowerBase, AssetType.rocketTowerHeadOneRocket, AssetType.smallRocket);
            case TowerType.gunTower:
                return new CTower(this.getGunTowerUpgradeOptionsMap(), AssetType.gunTowerBase, AssetType.gunTowerHead, AssetType.gunBullet);
            default:
                console.error("Unknown Tower Type");
                debugger;
        }
    }
}