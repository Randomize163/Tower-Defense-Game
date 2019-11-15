import { assert, toFixed } from './td-utils.js'
import { Display } from './td-display.js';
import { CRandomLevel } from './td-level-random.js';
import { AssetType, CKenneyAssetsCollection } from './td-asset.js';
import { TowerType, CTowerFactory, UpgradeOptions, upgradeOptionToString, upgradeOptionIconPath, getOptionValue, getOptionCost } from './td-tower-factory.js';
import { CEnemy } from './td-enemy.js';
import { CEnemyAttack, generateWaveDescription } from './td-enemy-attack.js'
 
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
    constructor(coinsElement, hpElement, textElement, fullscreenElement)
    {
        this.coinsElement = coinsElement;
        this.hpElement = hpElement;
        this.fullscreenElement = fullscreenElement;
        this.textElement = textElement;
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

    showText(text)
    {
        this.textElement.innerHTML = text;
    }
}

class CGameBuildMenu
{
    constructor(assets)
    {
        this.assets = assets;
        
        this.gameBuildsMenu = document.getElementById("game-builds-menu");
        this.hide();

        this.buildOptionTemplateElement = document.getElementById("build-option-template");
    }

    displayBuildsOptions(buildOptions, tileX, tileY)
    {
        this.hide();
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

            newElement.querySelector('.build-option-damage').innerHTML += getOptionValue(buildDescription.upgradeOptionsMap.get(UpgradeOptions.damage));
            newElement.querySelector('.build-option-range').innerHTML += getOptionValue(buildDescription.upgradeOptionsMap.get(UpgradeOptions.range));
            newElement.querySelector('.build-option-reload-speed').innerHTML += getOptionValue(buildDescription.upgradeOptionsMap.get(UpgradeOptions.reloadTime));

            newElement.onclick = () => {
                gameManager.onBuildTowerClick(buildDescription, buildType, tileX, tileY);
            };

            newElement.style.display = 'block';
            this.gameBuildsMenu.appendChild(newElement);
        });

        this.show();
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

    hide()
    {
        this.gameBuildsMenu.style.display = 'none';
    }

    show()
    {
        this.gameBuildsMenu.style.display = 'block';
    }
}

class CGameUpgradesMenu 
{
    constructor()
    {
        this.menu = document.getElementById("game-upgrade-menu");
        this.hide();

        this.optionTemplateElement = document.getElementById("upgrade-option-template");
    }

    displayUpgradeOptions(options, tileX, tileY)
    {
        this.clear();

        options.forEach((params, upgradeOption) => {
            const newElement = this.optionTemplateElement.cloneNode(true);

            newElement.removeAttribute('id');
            newElement.querySelector('.upgrade-option-name').innerHTML = upgradeOptionToString(upgradeOption);
            newElement.querySelector('.upgrade-option-value').innerHTML += toFixed(getOptionValue(params), 3);
            newElement.querySelector('.upgrade-option-level').innerHTML += `${params.currentLevel} / ${params.maxLevel}`;
            newElement.querySelector('.upgrade-option-price-value').innerHTML = getOptionCost(params);
            newElement.querySelector('.upgrade-option-icon').src = upgradeOptionIconPath(upgradeOption);

            if (params.currentLevel < params.maxLevel)
            {
                if (gameManager.coins < getOptionCost(params))
                {
                    newElement.querySelector('.upgrade-option-price-value').style.color = "red";
                }
                else
                {
                    newElement.onclick = () => {
                        gameManager.onUpgradeTowerClick([upgradeOption, params], tileX, tileY);
                    };
                }
            }
            else
            {
                newElement.querySelector('.option-price').innerHTML = '';
            }

            newElement.style.display = 'block';
            this.menu.appendChild(newElement);
        });

        this.show(); 
    }

    show() 
    {
        this.menu.style.display = 'block';
    }

    hide()
    {
        this.menu.style.display = 'none';
    }

    clear()
    {
        // remove all children
        this.menu.innerHTML = '';
    }
}

let gameManager = null;

class GameManager 
{
    constructor()
    {
        this.fullscreenElement = document.getElementById('grid-item-game');
        this.borderSize = this.fullscreenElement.style.borderWidth;

        this.header = new CGameHeader(
            document.getElementById("coins-value"), 
            document.getElementById("hp-value"), 
            document.getElementById('header-game-text'), 
            document.getElementById('fullscreen-hashtag')
        );
        this.footer = new CGameFooter(document.getElementById("game-right-footer-pause-svg"), document.getElementById("game-right-footer-play-svg"));

        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.canvasMinimizedWidth = this.canvas.width;
        this.canvasMinimizedHeight = this.canvas.height;
        this.defaultTileSize = 64;
        this.gameSpeed = 1;

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

    startGame()
    {
        this.enemyAttack = new CEnemyAttack(this, generateWaveDescription());
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
        this.upgradeMenu = new CGameUpgradesMenu();
        
        this.footer.hidePauseButton();
        this.footer.showPlayButton();
        this.gameState = GameState.notStarted;
        this.gameSpeed = 1;
        this.printGameStatusToHeader();
    
        this.startGameLoop();
    }

    calculateObjects(timeDelta)
    {
        this.enemyAttack.calculate(timeDelta);
        this.towers.forEach((tower) => tower.calculate(timeDelta, this.enemies));

        const lifeEnemies = [];
        this.enemies.forEach((enemy) => {
            enemy.calculate(timeDelta);
            if (enemy.finishedPath) this.hit();
            if (!enemy.destroyed) lifeEnemies.push(enemy);
            if (enemy.destroyed && !enemy.finishedPath) 
            {
                this.coins += enemy.killBonus;
            }
        });
        this.enemies = lifeEnemies;
        
        if (this.enemies.length == 0) this.enemyAttack.beginNextWave();
    }

    hit(damage = 1)
    {
        this.hp = Math.max(this.hp - damage, 0);

        if (this.hp == 0)
        {
            this.gameOver();
        }
    }

    gameOver()
    {
        this.gameState = GameState.finished;
        this.footer.hidePauseButton();
        this.footer.showPlayButton();
        document.getElementById("game-right-footer-play").onclick = () => window.location.reload();
    }

    gameLoop(timeDelta)
    {
        if (this.gameState == GameState.running)
        {
            this.calculateObjects(timeDelta);
        }
        
        this.display.clear();
        
        this.level.display(this.display);
        this.towers.forEach((tower) => tower.display(this.display));
        this.enemies.forEach((enemy) => enemy.display(this.display));

        this.header.updateCoins(this.coins);
        this.header.updateHp(this.hp);
        this.printGameStatusToHeader();
    }

    static gameLoopHelper(timestamp)
    {
        if (!gameManager.lastTimeStamp) gameManager.lastTimeStamp = timestamp;
        let timeDelta = timestamp - gameManager.lastTimeStamp;
        gameManager.gameLoop(timeDelta * gameManager.gameSpeed);
        gameManager.loopCancelationId = window.requestAnimationFrame(GameManager.gameLoopHelper);
        gameManager.lastTimeStamp = timestamp;
    }

    addEnemy(type, hp, speed, killBonus)
    {      
        const [beginX, beginY] = this.level.getBegin();
        const enemy = new CEnemy(beginX + Math.random(), beginY + Math.random(), 0, speed, hp, killBonus, 0.1, type);
        enemy.setPath(this.level.getPath());
        this.enemies.push(enemy);

        this.printGameStatusToHeader();
    }

    startGameLoop()
    {
        this.loopCancelationId = window.requestAnimationFrame(GameManager.gameLoopHelper);
    }

    stopGameLoop()
    {
        window.cancelAnimationFrame(this.loopCancelationId);
    }

    onUpgradeTowerClick([upgradeOption, params], tileX, tileY)
    {
        if (this.gameState != GameState.running) return;

        if (this.coins < getOptionCost(params)) return;

        const tower = this.towersMap[tileX][tileY];
        this.coins -= getOptionCost(params);
        tower.upgrade(upgradeOption);

        this.upgradeMenu.displayUpgradeOptions(tower.getUpgradeOptions(), tileX, tileY);
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
        if (this.gameState != GameState.running)
        {
            return;
        }

        const coordinate = this.getMouseCoordinateOnCanvas(event);
        if (!this.display.coordinateIsOnPicture(coordinate[0], coordinate[1]))
        {
            this.buildMenu.hide();
            this.upgradeMenu.hide();
            return;
        }

        let [tileX, tileY] = this.display.getTileFromCoordinate(coordinate);
        tileX = Math.floor(tileX);
        tileY = Math.floor(tileY);

        const tower = this.towersMap[tileX][tileY];
        if (this.level.isPossibleToBuildOnTile(tileX, tileY) && !tower)
        {
            const buildOptions = this.towerFactory.getBuildTowerOptions();
            this.buildMenu.displayBuildsOptions(buildOptions, tileX, tileY);
            this.upgradeMenu.hide();
        }
        else
        if (tower)
        {
            this.buildMenu.hide();
            this.upgradeMenu.displayUpgradeOptions(tower.getUpgradeOptions(), tileX, tileY);
        } 
        else 
        {
            this.buildMenu.hide();
            this.upgradeMenu.hide();
        }
    }

    onBuildTowerClick(buildDescription, buildType, tileX, tileY)
    {
        if (this.gameState != GameState.running)
        {
            return;
        }

        if (this.coins < buildDescription.price)
        {
            return;
        }

        const tower = this.towerFactory.createTower(buildType);
        tower.setPlace(tileX, tileY);

        this.towers.push(tower);
        this.towersMap[tileX][tileY] = tower;

        this.coins -= buildDescription.price;

        this.buildMenu.hide();
    }

    onPauseClick()
    {
        this.gameState = GameState.paused;
        this.footer.hidePauseButton();
        this.printGameStatusToHeader();
    }

    onPlayClick()
    {
        if (this.gameState == GameState.notStarted)
        {
            this.gameSpeed = 1;
            this.footer.showFastPlayButton();
            this.startGame();
        }
        else
        if (this.gameState == GameState.running)
        {
            /*if (this.gameSpeed == 1)
            {
                this.gameSpeed = 2;
                this.footer.showPlayButton();
            }
            else
            {
                assert(this.gameSpeed == 2)
                this.gameSpeed = 1;
                this.footer.showFastPlayButton();
            }*/
            this.gameSpeed += 1;
            if (this.gameSpeed == 5) this.gameSpeed = 1;

            this.footer.showFastPlayButton();
        }
    
        this.gameState = GameState.running;
        this.footer.showPauseButton();
        this.printGameStatusToHeader();
    }

    printGameStatusToHeader()
    {
        let text = "";
        switch (this.gameState)
        {
            case GameState.notStarted:
                text = "Press Play to Begin";
                break;
            case GameState.paused:
                text = "Press Play To Continue";
                break;
            case GameState.running:
                text = this.getLevelStatus();
                break;
            case GameState.finished:  
                text = "Game Over! You've got to " + this.getLevelStatus();
                break;
            default:
                text = '';
                break;
        }

        this.header.showText(text);
    }

    getLevelStatus()
    {
        return this.enemyAttack.getCurrentWaveDescription().name;
    }
}

function initialize()
{
    initializeComponents();
    initializeCallbacks();

    const gameParams = {
        'startHp':100,
        'startCoins':200,
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