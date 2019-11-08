import { assert } from './td-utils.js'
import { Camera, Display } from './td-camera.js';
import { CRandomLevel } from './td-level-random.js';
import { AssetType, CKenneyAssetsCollection } from './td-asset.js';

const ScreenState = Object.freeze(
{
    "fullscreen":0,
    "minimized":1,
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

    changeScreenState(state) 
    {
        if (state == ScreenState.minimized)
        {
            this.fullscreenElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#fullscreen");
        }
        else
        {
            assert(state == ScreenState.fullscreen);
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
        this.borderSize = this.fullscreenElement.style.borderWidth;

        this.header = new CGameHeader(document.getElementById("coins-value"), document.getElementById("hp-value"), document.getElementById('fullscreen-hashtag'));

        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.canvasMinimizedWidth = this.canvas.width;
        this.canvasMinimizedHeight = this.canvas.height;
        this.defaultTileSize = 64;

        this.lastTimeStamp = null;
        
        this.mouse = {};
    }

    adjustToMinimizedScreen() 
    {
        this.header.changeScreenState(ScreenState.minimized);

        this.canvas.width = this.canvasMinimizedWidth; 
        this.canvas.height = this.canvasMinimizedHeight;
        
        this.display.fitPictureToDisplay(this.canvas.width, this.canvas.height);
    }

    adjustToFullScreen()
    {
        this.header.changeScreenState(ScreenState.fullscreen);

        this.canvas.width = screen.availWidth - 60; // substract border size
        this.canvas.height = screen.availHeight - 60;

        this.display.fitPictureToDisplay(this.canvas.width, this.canvas.height);
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
        this.level = new CRandomLevel(gameParams.levelParams);
        this.hp = gameParams.startHp;
        this.coins = gameParams.startCoins;
        
        this.assets = new CKenneyAssetsCollection();
        await this.assets.initialize();
        this.display = new Display(this.ctx, this.assets, this.canvasMinimizedWidth, this.canvasMinimizedHeight, this.level.width, this.level.height);
        this.buildMenu = new CGameBuildMenu(this.assets);
        
        this.startGameLoop();
    }

    gameLoop(timeDelta)
    {
        this.display.clear();
        this.level.display(this.display);
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

    onWheel(event)
    {
        const tileSizeDelta = -event.deltaY * 0.05;
        this.display.zoom(tileSizeDelta, this.mouseCoordinatesOnCanvas(event));
    }

    onMouseUp(event)
    {
        this.mouse.up = true;
        this.mouse.down = false;
        this.mouse.drag = false;
        this.mouse.lastCoordinate = null;
        this.mouse.downCoordinate = null;
    }

    onMouseDown(event)
    {
        this.mouse.down = true;
        this.mouse.up = false;
        this.mouse.downCoordinate = [event.clientX, event.clientY];
    }

    onMouseMove(event)
    {
        this.mouse.move = true;
        if (this.mouse.down == true)
        {
            this.mouse.drag = true;
            const currentCoordinate = [event.clientX, event.clientY]

            if (!this.mouse.lastCoordinate) {
                assert(this.mouse.downCoordinate);
                this.mouse.lastCoordinate = this.mouse.downCoordinate;
            } 
            
            this.display.movePicture(currentCoordinate[0] - this.mouse.lastCoordinate[0], currentCoordinate[1] - this.mouse.lastCoordinate[1]);
            this.mouse.lastCoordinate = currentCoordinate;
        }
    }

    mouseCoordinatesOnCanvas(event)
    {
        const rect = this.canvas.getBoundingClientRect();
        return [event.clientX - rect.left, event.clientY - rect.top];
    }

    onCenterFocusClick()
    {
        this.display.fitPictureToDisplay(this.canvas.width, this.canvas.height);
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
            'width':5,
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

    document.getElementById("center-focus").onclick = () => gameManager.onCenterFocusClick();
    
    const gameElement = document.getElementById('game');
    gameElement.onwheel = (event) => gameManager.onWheel(event);

    gameElement.onmousedown = (event) => gameManager.onMouseDown(event);
    gameElement.onmouseup = (event) => gameManager.onMouseUp(event); 
    gameElement.onmousemove = (event) => gameManager.onMouseMove(event);
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