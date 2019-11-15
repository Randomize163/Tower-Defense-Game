import { AssetLoader } from './td-asset-loader.js'
import { assert } from './td-utils.js';

export const AssetType = Object.freeze(
    {
        "emptyTile":0,
        "roadTile":1,
        "beginTile":2,
        "endTile":3,
        "towerTile":4,
        "stone1Tile":5,
        "stone2Tile":6,
        "stone3Tile":7,
        "bush1Tile":8,
        "bush2Tile":9,
        "bush3Tile":10,
        "transparentTile":11,
        "rocketTowerBase":21,
        "rocketTowerHeadTwoRockets":22,
        "rocketTowerHeadOneRocket":23,
        "gunTowerBase":24,
        "gunTowerHead":25,
        "gunBullet":26,
        "enemyBasic":30,
        "enemyBasicFast":31,
        "enemyTankGreen":32,
        "enemyTankWhite":33,
        "smallRocket":34,
    });

export class IAssetCollection
{
    //
    // getAsset - returns asset with size, position and image object
    //
    getAsset(type)
    {
        return {
            "image": this.image,
            "sx":0,
            "sy":0,
            "sWidth":0,
            "sHeight":0
        }
    }
}

export class CKenneyAssetsCollection extends IAssetCollection
{
    constructor()
    {
        super();
        this.src = 'images/tower-defense-tilesheet-kenney.png';
        this.name = 'kenney';
        this.sTileWidth = 128;
        this.sTileHeight = 128;

        this.assetMap = new Map([
            [
                AssetType.gunBullet,
                {
                    sx: this.sTileWidth * 19,
                    sy: this.sTileHeight * 11,
                }
            ],
            [
                AssetType.gunTowerBase,
                {
                    sx: this.sTileWidth * 19,
                    sy: this.sTileHeight * 7,
                }
            ],
            [
                AssetType.gunTowerHead,
                {
                    sx: this.sTileWidth * 19,
                    sy: this.sTileHeight * 10,
                }
            ],
            [
                AssetType.smallRocket,
                {
                    sx: this.sTileWidth * 21,
                    sy: this.sTileHeight * 10,
                }
            ],
            [
                AssetType.enemyTankWhite,
                {
                    sx: this.sTileWidth * 16,
                    sy: this.sTileHeight * 11,
                }
            ],
            [
                AssetType.enemyTankGreen,
                {
                    sx: this.sTileWidth * 15,
                    sy: this.sTileHeight * 11,
                }
            ],
            [
                AssetType.enemyBasic,
                {
                    sx: this.sTileWidth * 15,
                    sy: this.sTileHeight * 10,
                }
            ],
            [
                AssetType.enemyBasicFast,
                {
                    sx: this.sTileWidth * 16,
                    sy: this.sTileHeight * 10,
                }
            ],
            [
                AssetType.rocketTowerBase,
                {
                    sx: this.sTileWidth * 20,
                    sy: this.sTileHeight * 7,
                }
            ],
            [
                AssetType.rocketTowerHeadTwoRockets,
                {
                    sx: this.sTileWidth * 20,
                    sy: this.sTileHeight * 8,
                }
            ],
            [
                AssetType.rocketTowerHeadOneRocket,
                {
                    sx: this.sTileWidth * 19,
                    sy: this.sTileHeight * 8,
                }
            ],
            [
                AssetType.endTile,
                {
                    sx: this.sTileWidth * 0,
                    sy: this.sTileHeight * 0,
                }
            ],
            [
                AssetType.beginTile,
                {
                    sx: this.sTileWidth * 0,
                    sy: this.sTileHeight * 1,
                }
            ],
            [
                AssetType.emptyTile,
                {
                    sx: this.sTileWidth * 22,
                    sy: this.sTileHeight * 6,
                }
            ],
            [
                AssetType.roadTile,
                {
                    sx: this.sTileWidth * 21,
                    sy: this.sTileHeight * 6,
                }
            ],
            [
                AssetType.towerTile,
                {
                    sx: this.sTileWidth * 20,
                    sy: this.sTileHeight * 4,
                }
            ], 
            [
                AssetType.stone1Tile,
                {
                    sx: this.sTileWidth * 20,
                    sy: this.sTileHeight * 5,
                }
            ], 
            [
                AssetType.stone2Tile,
                {
                    sx: this.sTileWidth * 21,
                    sy: this.sTileHeight * 5,
                }
            ],   
            [
                AssetType.stone3Tile,
                {
                    sx: this.sTileWidth * 22,
                    sy: this.sTileHeight * 5,
                }
            ],   
            [
                AssetType.bush1Tile,
                {
                    sx: this.sTileWidth * 15,
                    sy: this.sTileHeight * 5,
                }
            ],  
            [
                AssetType.bush2Tile,
                {
                    sx: this.sTileWidth * 18,
                    sy: this.sTileHeight * 5,
                }
            ],  
            [
                AssetType.bush3Tile,
                {
                    sx: this.sTileWidth * 19,
                    sy: this.sTileHeight * 5,
                }
            ],  
        ]);
    }

    //
    // initialize - loads image (and initialize datastructures)
    //
    async initialize()
    {
        return AssetLoader.loadImage(this.name, this.src).then(
            image => {this.image = image},
            error => {
                console.log(error);
                debugger;
            }
        );
    }

    getAsset(type)
    {
        assert(this.image);

        let asset = {};
        asset.image = this.image;
        asset.sWidth = this.sTileWidth;
        asset.sHeight = this.sTileHeight;

        const a = this.assetMap.get(type);
        if (!a)
        {
            console.error("Unknown asset type");
            debugger;
        }
        
        asset.sx = a.sx;
        asset.sy = a.sy;
        
        return asset;
    }
}