import { assert } from './td-utils.js'

export class IGameHeader 
{
    coinsElement;
    hpElement;
    fullscreenElement;

    updateHp(hp) {}

    updateCoins(coins) {}

    changeFullscreenState(state) {}
}

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

let gameManager = null;

class GameManager 
{
    constructor()
    {
        this.fullscreenElement = document.getElementById('grid-item-game');
        this.header = new CGameHeader(document.getElementById("coins-value"), document.getElementById("hp-value"), document.getElementById('fullscreen-hashtag'));
        this.canvas = document.getElementById('game');
        this.canvasInitialWidth = this.canvas.width;
        this.canvasInitialHeight = this.canvas.height;
    }

    onFullscreenClick()
    {
        if (!document.fullscreenElement)
        {
            this.fullscreenElement.requestFullscreen().then( () => {
                this.header.changeFullscreenState(FullscreenState.fullscreen);
                this.canvas.width = screen.availWidth;
                this.canvas.height = screen.availHeight;
            }).catch( () => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }
        else
        {
            document.exitFullscreen().then( () => {
                this.header.changeFullscreenState(FullscreenState.exitFullscreen);
                this.canvas.width = this.canvasInitialWidth;
                this.canvas.height = this.canvasInitialHeight;
                // TODO: Update camera
            }).catch( () => {
                alert(`Error attempting to exit form full-screen mode: ${err.message} (${err.name})`);
            });
        }
    }
}

function initialize()
{
    initializeComponents();
    initializeCallbacks();
}

function initializeComponents()
{
    gameManager = new GameManager();
}

function initializeCallbacks()
{
    document.getElementById("fullscreen-icon").onclick = () => gameManager.onFullscreenClick();
}

initialize();