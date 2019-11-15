import { AssetType } from './td-asset.js';
import { CTower } from './td-tower.js';
import { getSquareSequenceWithParams } from './td-utils.js';

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

export function upgradeOptionToString(upgradeOption)
{
    switch (upgradeOption) 
    {
        case UpgradeOptions.damage:
            return "Damage";
        case UpgradeOptions.range:
            return "Range";
        case UpgradeOptions.reloadTime:
            return "Reload Time";
        case UpgradeOptions.rocketSpeed:
            return "Bullet Speed";         
        default:
            debugger;
    }
}

export function upgradeOptionIconPath(upgradeOption)
{
    switch (upgradeOption) 
    {
        case UpgradeOptions.damage:
            return "/images/upgrades/damage.png";
        case UpgradeOptions.range:
            return "/images/upgrades/range.png";
        case UpgradeOptions.reloadTime:
            return "/images/upgrades/reload-time.png";
        case UpgradeOptions.rocketSpeed:
            return "/images/upgrades/bullet-speed.png";         
        default:
            debugger;
    }
}

export function getOptionCost(option)
{
    return option.costFunction(option.currentLevel);
}

export function getOptionValue(option)
{
    return option.valueFunction(option.currentLevel);
}

class ITowerFactory
{
    getBuildTowerOptions() {}

    createTower(towerType, towerParams = null) {}
}

function getDefaultCostFunction()
{
    return getSquareSequenceWithParams(500, 500, 500);
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
                    'price':50,
                    'layers': [
                        AssetType.gunTowerBase,
                        AssetType.gunTowerHead,
                    ],
                    'type':TowerType.gunBullet,
                    'upgradeOptionsMap': this.gunTowerUpgradeOptionsMap,             
                },
            ],
            [
                TowerType.rocketTower,
                {
                    'name':'Rocket Tower',
                    'price':100,
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
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(10, 15, 0),
                }
            ],
            [
                UpgradeOptions.range, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(5, 0.5, 0),
                }
            ],
            [
                UpgradeOptions.reloadTime, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(1000, -100, 0),
                } 
            ],
            [
                UpgradeOptions.rocketSpeed, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(0.005, 0.002, 0),
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
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(5, 10, 0),
                }
            ],
            [
                UpgradeOptions.range, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(3, 0.5, 0),
                }
            ],
            [
                UpgradeOptions.reloadTime, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(300, -50, 0),
                } 
            ],
            [
                UpgradeOptions.rocketSpeed, 
                {
                    "currentLevel": 0,
                    "maxLevel": 5,
                    "costFunction": getDefaultCostFunction(),
                    "valueFunction": getSquareSequenceWithParams(0.03, 0.005, 0),
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