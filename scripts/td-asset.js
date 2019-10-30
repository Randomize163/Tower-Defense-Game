import { AssetLoader } from './td-asset-loader.js'
import { assert } from './td-utils.js';

export const AssetType = Object.freeze(
    {
        "emptyTile":0,
        "roadTile":1,
        "beginTile":2,
        "endTile":3,
        "towerTile":4,
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
            case AssetType.emptyTile:
                asset.sx = this.sTileWidth * 22;
                asset.sy = this.sTileHeight * 6;
                break;

            case AssetType.roadTile:
            case AssetType.endTile:
            case AssetType.beginTile:
                asset.sx = this.sTileWidth * 21;
                asset.sy = this.sTileHeight * 6;
                break;    
            case AssetType.towerTile:
                asset.sx = this.sTileWidth * 20;
                asset.sy = this.sTileHeight * 4;
                break;  
            default:
                console.error("Unknown asset type");
                debugger;
        }

        return asset;
    }
}