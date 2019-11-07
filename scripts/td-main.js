import { assert } from './td-utils.js'
import { Camera } from './td-camera.js';
import { CRandomLevel } from './td-level-random.js';
import { AssetType, CKenneyAssetsCollection } from './td-asset.js';

const FullscreenState = Object.freeze(
{
    "fullscreen":0,
    "exitFullscreen":1,
});

class CGameHeader
{
    constructor(coinsElement, hpElement, fullscreenElement)
    {
        this.coinsElement = coinsElement;
        this.hpElement = hpElement;
        this.fullscreenElement = fullscreenElement;
    }

    updateHp(hp) 
    {
        this.hpElement.innerHTML = hp.toString();
    }

    updateCoins(coins) 
    {
        this.coinsElement.innerHTML = coins.toString();
    }

    changeFullscreenState(state) 
    {
        if (state == FullscreenState.exitFullscreen)
        {
            this.fullscreenElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#fullscreen");
        }
        else
        {
            assert(state == FullscreenState.fullscreen);
            this.fullscreenElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#exit-full-screen");
        }
    }
}

class CGameBuildMenu
{
    constructor(assets)
    {
        this.assets = assets;
        
        this.gameBuildsMenu = document.getElementById("game-builds-menu");
        this.hideBuildsMenu();

        this.buildOptionTemplateElement = document.getElementById("build-option-template");
        this.buildOptionTemplateElement.style.display = 'none';

    }

    displayBuildsOptions(buildOptions)
    {
        buildOptions.forEach( (option) => {
            const newElement = this.buildOptionTemplateElement.cloneNode(true);
            newElement.removeAttribute('id');
            const canvas = newElement.querySelector('.build-option-canvas');
            const ctx = canvas.getContext('2d');
            option.layers.forEach( (assetType) => {
                this.displayBuildPicture(ctx, canvas.width, canvas.height, assetType);
            });

            newElement.style.display = 'block';
            this.gameBuildsMenu.appendChild(newElement);
        });

        this.showBuildsMenu();
    }

    displayBuildPicture(ctx, width, height, assetType)
    {
        const asset = this.assets.getAsset(assetType);
        ctx.drawImage(asset.image, asset.sx, asset.sy, asset.sWidth, asset.sHeight, 0, 0, width, height);
    }

    hideBuildsMenu()
    {
        this.gameBuildsMenu.style.display = 'none';
    }

    showBuildsMenu()
    {
        this.gameBuildsMenu.style.display = 'block';
    }
}

let gameManager = null;

class GameManager 
{
    constructor()
    {
        this.fullscreenElement = document.getElementById('grid-item-game');
        
        this.header = new CGameHeader(document.getElementById("coins-value"), document.getElementById("hp-value"), document.getElementById('fullscreen-hashtag'));

        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.canvasInitialWidth = this.canvas.width;
        this.canvasInitialHeight = this.canvas.height;
        this.defaultTileSize = 64;

        this.lastTimeStamp = null;
    }

    adjustToMinimizedScreen() 
    {
        this.header.changeFullscreenState(FullscreenState.exitFullscreen);
        this.canvas.width = this.canvasInitialWidth - 50;
        this.canvas.height = this.canvasInitialHeight - 10;
        this.camera.changeResolution(this.canvas.width, this.canvas.height);
        
        this.adjustToFitScreenSize();
    }

    adjustToFitScreenSize()
    {
        assert(this.level);
        
        const tileSizeToFitWidth = Math.floor(this.canvas.width / this.level.width);
        const tileSizeToFitHeight = Math.floor(this.canvas.height / this.level.height);
        const tileSizeToFitScreen = Math.min(tileSizeToFitWidth, tileSizeToFitHeight);
        
        this.canvas.height = this.level.height * tileSizeToFitScreen;
        this.canvas.width = this.level.width * tileSizeToFitScreen;
        
        this.camera.changeTileSize(tileSizeToFitScreen);
    }

    adjustToFullScreen()
    {
        this.header.changeFullscreenState(FullscreenState.fullscreen);
        this.canvas.width = screen.availWidth - 50; // substract boarder size
        this.canvas.height = screen.availHeight - 50;
        this.camera.changeResolution(this.canvas.width, this.canvas.height);

        this.adjustToFitScreenSize();
    }

    onFullscreenClick()
    {
        if (!document.fullscreenElement)
        {
            this.fullscreenElement.requestFullscreen().then( () => {
                this.adjustToFullScreen();
            }).catch( () => {
                alert(`Error attempting to enable full-screen mode`);
            });
        }
        else
        {
            document.exitFullscreen().then( () => {
                this.adjustToMinimizedScreen();
            }).catch( () => {
                alert(`Error attempting to exit form full-screen mode: ${err.message} (${err.name})`);
            });
        }
    }

    async beginGame(gameParams)
    {
        this.camera = new Camera(this.canvasInitialWidth, this.canvasInitialHeight, gameParams.initialTileSize, 0, 0);
        this.level = new CRandomLevel(gameParams.levelParams);
        this.hp = gameParams.startHp;
        this.coins = gameParams.startCoins;
        
        this.assets = new CKenneyAssetsCollection();
        await this.assets.initialize();
        this.buildMenu = new CGameBuildMenu(this.assets);
        
        this.adjustToFitScreenSize();
        this.startGameLoop();
    }

    gameLoop(timeDelta)
    {
        this.level.display(this.ctx, this.assets, this.camera);
        this.header.updateCoins(this.coins);
        this.header.updateHp(this.hp);
    }

    static gameLoopHelper(timestamp)
    {
        if (!gameManager.lastTimeStamp) gameManager.lastTimeStamp = timestamp;
        let timeDelta = timestamp - gameManager.lastTimeStamp;
        gameManager.gameLoop(timeDelta);
        gameManager.loopCancelationId = window.requestAnimationFrame(GameManager.gameLoopHelper);
    }

    startGameLoop()
    {
        this.loopCancelationId = window.requestAnimationFrame(GameManager.gameLoopHelper);
    }

    stopGameLoop()
    {
        window.cancelAnimationFrame(this.loopCancelationId);
    }
}

function initialize()
{
    initializeComponents();
    initializeCallbacks();

    const gameParams = {
        'startHp':100,
        'startCoins':500,
        'initialTileSize':74,
        'levelParams': {
            'width':6,
            'height':3,
            'floorParams': {
                'towerTilesFillFactor':0.6,
            },
            'decorationsParams': {
                'fillFactors': [
                    {   
                        'value':AssetType.stone2Tile, 
                        'prob':0.1,
                    },
                    {   
                        'value':AssetType.bush1Tile, 
                        'prob':0.2,
                    },
                    {   
                        'value':AssetType.bush3Tile, 
                        'prob':0.1,
                    },
                    {   
                        'value':AssetType.emptyTile, 
                        'prob':0.6,
                    },
                ],
            },
        },
    };
    gameManager.beginGame(gameParams);
}

function initializeComponents()
{
    gameManager = new GameManager();
}

function initializeCallbacks()
{
    document.getElementById("fullscreen-icon").onclick = () => gameManager.onFullscreenClick();
    document.onfullscreenchange = () => {
        if (!document.fullscreen) gameManager.adjustToMinimizedScreen();
    };

}

initialize();

// displayBuildsOptions test
/*const buildOptions = [
    {
        'description':'Rocket Tower',
        'cost':100,
        'layers': [
            AssetType.rocketTowerBase,
            AssetType.rocketTowerHead,
        ],
    },
    {
        'description':'Rocket Tower',
        'cost':100,
        'layers': [
            AssetType.rocketTowerBase,
            AssetType.rocketTowerHead,
        ],
    },
];

this.buildMenu.displayBuildsOptions(buildOptions);
*/