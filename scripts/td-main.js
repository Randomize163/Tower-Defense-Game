import { assert } from './td-utils.js'
import { Camera, Display } from './td-camera.js';
import { CRandomLevel } from './td-level-random.js';
import { AssetType, CKenneyAssetsCollection } from './td-asset.js';
import { TowerType, CTowerFactory } from './td-tower-factory.js';

const ScreenState = Object.freeze(
{
    "fullscreen":0,
    "minimized":1,
});

const GameState = Object.freeze(
{
    "notStarted":0,
    "running":1,
    "paused":2,
    "finished":3,
});
    
class CGameFooter
{
    constructor(pauseElement, playSpeedElement) 
    {
        this.pauseElement = pauseElement;
        this.playSpeedElement = playSpeedElement;
    }

    hidePauseButton()
    {
        this.pauseElement.style.display = 'none';
    }

    showPauseButton()
    {
        this.pauseElement.style.display = 'block';
    }

    showFastPlayButton()
    {
        this.playSpeedElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#fast-forward");
    }

    showPlayButton()
    {
        this.playSpeedElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', "#play-button");
    }
}

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
    }

    displayBuildsOptions(buildOptions, tileX, tileY)
    {
        this.hideBuildsMenu();
        this.clearBuildsOptions();
        

        buildOptions.forEach( (buildDescription, buildType) => {
            const newElement = this.buildOptionTemplateElement.cloneNode(true);
            
            newElement.removeAttribute('id');
            
            const canvas = newElement.querySelector('.build-option-canvas');
            const ctx = canvas.getContext('2d');
            buildDescription.layers.forEach( (assetType) => {
                this.displayBuildPicture(ctx, canvas.width, canvas.height, assetType);
            });

            newElement.querySelector('.build-option-name').innerHTML = buildDescription.name;
            newElement.querySelector('.build-coins-value').innerHTML = buildDescription.price;

            newElement.onclick = () => {
                gameManager.onBuildTowerClick(buildDescription, buildType, tileX, tileY);
            };

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

    clearBuildsOptions()
    {
        // remove all children
        this.gameBuildsMenu.innerHTML = '';
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
        this.footer = new CGameFooter(document.getElementById("game-right-footer-pause-svg"), document.getElementById("game-right-footer-play-svg"));

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
        
        this.towerFactory = new CTowerFactory();
        this.towersMap = Array.from(Array(this.level.width), () => new Array(this.level.height));
        this.towers = [];

        this.enemies = [];

        this.assets = new CKenneyAssetsCollection();
        await this.assets.initialize();
        this.display = new Display(this.ctx, this.assets, this.canvasMinimizedWidth, this.canvasMinimizedHeight, this.level.width, this.level.height);
        
        this.buildMenu = new CGameBuildMenu(this.assets);
        
        this.footer.hidePauseButton();
        this.footer.showPlayButton();
        this.gameState = GameState.paused;
        this.gameSpeed = 1;
    
        this.startGameLoop();
    }

    gameLoop(timeDelta)
    {
        this.display.clear();
        
        this.level.display(this.display);
        this.towers.forEach((tower) => {
            tower.display(this.display);
        });

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
        this.display.zoom(tileSizeDelta, this.getMouseCoordinateOnCanvas(event));
    }

    onMouseUp(event)
    {
        this.mouse.up = true;
        this.mouse.down = false;
        this.mouse.drag = false;
    }

    onMouseDown(event)
    {
        this.mouse.down = true;
        this.mouse.up = false;
    }

    onMouseMove(event)
    {
        this.mouse.move = true;
        if (this.mouse.down == true)
        {
            this.mouse.drag = true;
            this.display.movePicture(event.movementX, event.movementY);
        }
    }

    getMouseCoordinateOnCanvas(event)
    {
        const rect = this.canvas.getBoundingClientRect();
        return [event.clientX - rect.left, event.clientY - rect.top];
    }

    onCenterFocusClick()
    {
        this.display.fitPictureToDisplay(this.canvas.width, this.canvas.height);
    }

    onClick(event)
    {
        if (this.gameState == GameState.paused)
        {
            return;
        }

        const coordinate = this.getMouseCoordinateOnCanvas(event);
        if (!this.display.coordinateIsOnPicture(coordinate[0], coordinate[1]))
        {
            this.buildMenu.hideBuildsMenu();
            return;
        }

        let [tileX, tileY] = this.display.getTileFromCoordinate(coordinate);
        tileX = Math.floor(tileX);
        tileY = Math.floor(tileY);

        if (this.level.isPossibleToBuildOnTile(tileX, tileY) && !this.towersMap[tileX][tileY])
        {
            const buildOptions = this.towerFactory.getBuildTowerOptions();
            this.buildMenu.displayBuildsOptions(buildOptions, tileX, tileY);
        }
        else
        {
            this.buildMenu.hideBuildsMenu();
        }   
    }

    onBuildTowerClick(buildDescription, buildType, tileX, tileY)
    {
        if (this.coins < buildDescription.price)
        {
            return;
        }

        const tower = this.towerFactory.createTower(buildType);
        tower.setPlace(tileX, tileY);

        this.towers.push(tower);
        this.towersMap[tileX][tileY] = tower;

        this.coins -= buildDescription.price;

        this.buildMenu.hideBuildsMenu();
    }

    onPauseClick()
    {
        this.gameState = GameState.paused;
        this.footer.hidePauseButton();
    }

    onPlayClick()
    {
        if (this.gameState == GameState.running)
        {
            if (this.gameSpeed == 1)
            {
                this.gameSpeed = 2;
                this.footer.showFastPlayButton();
            }
            else
            {
                assert(this.gameSpeed == 2)
                this.gameSpeed = 1;
                this.footer.showPlayButton();
            }
        }

        this.gameState = GameState.running;
        this.footer.showPauseButton();
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
    document.addEventListener("mouseup", (event) => gameManager.onMouseUp(event));
    document.addEventListener("mousemove", (event) => gameManager.onMouseMove(event));
    gameElement.onclick = (event) => gameManager.onClick(event);

    document.getElementById("game-right-footer-pause-svg").onclick = () => gameManager.onPauseClick();
    document.getElementById("game-right-footer-play").onclick = () => gameManager.onPlayClick();
}

initialize();