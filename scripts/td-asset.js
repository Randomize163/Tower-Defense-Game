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
        "rocketTowerHead":22,
        "enemyBasic":30,
    });

export class IAssetCollection
{
    constructor(name, src)
    {
        this.src = src;
        this.name = name;
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
        super('kenney', '../images/tower-defense-tilesheet-kenney.png');
        this.sTileWidth = 128;
        this.sTileHeight = 128;
    }

    getAsset(type)
    {
        assert(this.image);

        let asset = {};
        asset.image = this.image;
        asset.sWidth = this.sTileWidth;
        asset.sHeight = this.sTileHeight;

        switch (type)
        {
            case AssetType.enemyBasic:
                asset.sx = this.sTileWidth * 15;
                asset.sy = this.sTileHeight * 10;
                break;
            case AssetType.rocketTowerBase:
                asset.sx = this.sTileWidth * 20;
                asset.sy = this.sTileHeight * 7;
                break;
            case AssetType.rocketTowerHead:
                asset.sx = this.sTileWidth * 20;
                asset.sy = this.sTileHeight * 8;
                break;
            case AssetType.endTile: 
                asset.sx = 0;
                asset.sy = 0;
                break;
            case AssetType.beginTile:
                asset.sx = 0;
                asset.sy = 128;
                break;
            case AssetType.emptyTile:
                asset.sx = this.sTileWidth * 22;
                asset.sy = this.sTileHeight * 6;
                break;
            case AssetType.roadTile:
                asset.sx = this.sTileWidth * 21;
                asset.sy = this.sTileHeight * 6;
                break;    
            case AssetType.towerTile:
                asset.sx = this.sTileWidth * 20;
                asset.sy = this.sTileHeight * 4;
                break;  
            case AssetType.stone1Tile:
                asset.sx = this.sTileWidth * 20;
                asset.sy = this.sTileHeight * 5;
                break;   
            case AssetType.stone2Tile:
                asset.sx = this.sTileWidth * 21;
                asset.sy = this.sTileHeight * 5;
                break;
            case AssetType.stone3Tile:
                asset.sx = this.sTileWidth * 22;
                asset.sy = this.sTileHeight * 5;
                break;
            case AssetType.bush1Tile:
                asset.sx = this.sTileWidth * 15;
                asset.sy = this.sTileHeight * 5;
                break;
            case AssetType.bush2Tile:
                asset.sx = this.sTileWidth * 18;
                asset.sy = this.sTileHeight * 5;
                break;
            case AssetType.bush3Tile:
                asset.sx = this.sTileWidth * 19;
                asset.sy = this.sTileHeight * 5;
                break;
            default:
                console.error("Unknown asset type");
                debugger;
        }

        return asset;
    }
}