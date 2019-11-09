import { AssetType } from './td-asset.js' 
import { CRocketTower } from './td-tower.js'

export const TowerType = Object.freeze(
{
    "rocketTower":0,
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
        this.buildTowerOptions = new Map([
            [
                TowerType.rocketTower,
                {
                    'name':'Rocket Tower',
                    'price':10,
                    'layers': [
                        AssetType.rocketTowerBase,
                        AssetType.rocketTowerHead,
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
    }

    getBuildTowerOptions() {
        return this.buildTowerOptions;
    }

    createTower(towerType) 
    {
        switch (towerType)
        {
            case TowerType.rocketTower:
                return new CRocketTower(this.getRocketTowerUpgradeOptionsMap());
            default:
                console.error("Unknown Tower Type");
                debugger;
        }
    }
}