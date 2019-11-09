import { IGameObject } from "./td-gameobject.js";
import { CircleCollider } from "./td-collider.js";
import { assert, distance, equalsFloats } from "./td-utils.js";

export class CEnemy extends IGameObject
{
    constructor(x, y, rotation, speed, hp, killBonus, radius, assetType)
    {
        super();
        this.maxHp = hp 
        this.hp = hp;
        this.speed = speed;
        this.killBonus = killBonus;
        this.tilesX = x;
        this.tilesY = y;
        this.collider = new CircleCollider(this, radius);
        this.rotation = rotation;
        this.assetType = assetType;

        // Pathfinding parameters:
        this.destinationDistanceThreshold = 0.2;

        // Healthbar parameters:
        this.barShiftYCoef = -0.3;
        this.barLengthXCoef = 0.5;
        this.barWidthCoef = 0.08;
        this.healthBarStrokeWidth = 1;
        this.healthBarStrokeStyle = 'black';
    }

    setPath(path)
    {
        this.path = path;
        this.nextPathPointIndex = 1;
    }

    getNextPosition(deltaTime)
    {
        assert(this.path.length > 0);
        
        let [destX, destY] = this.path[this.nextPathPointIndex];
        destX += 0.5;
        destY += 0.5;

        const dx = destX - this.tilesX;
        const dy = destY - this.tilesY;
        const angle = Math.atan2(dy, dx);

        const nextPosition = {};

        const step = deltaTime * this.speed;
        if (step >= distance(this.tilesX, this.tilesY, destX, destY))
        {
            nextPosition.x = destX;
            nextPosition.y = destY;
            nextPosition.rotation = angle;
            return nextPosition;
        }

        const stepX = step * Math.cos(angle);
        const stepY = step * Math.sin(angle);

        nextPosition.x = this.tilesX + stepX;
        nextPosition.y = this.tilesY + stepY;
        nextPosition.rotation = angle;

        return nextPosition;
    }

    calculate(deltaTime)
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.finishedPath)
        {
            this.destroy();
            return;
        }

        let {x, y, rotation} = this.getNextPosition(deltaTime);
        this.tilesX = x;
        this.tilesY = y;
        this.rotation = rotation;

        const [destX, destY] = this.path[this.nextPathPointIndex];
        if (distance(this.tilesX, this.tilesY, destX + 0.5, destY + 0.5) < this.destinationDistanceThreshold)
        {
            this.nextPathPointIndex++;
        }

        if (this.nextPathPointIndex == this.path.length)
        {
            this.finishedPath = true;
            console.log("Enemy finished path");
        }
    }

    destroy()
    {
        this.destroyed = true;
    }

    displayModel(display)
    {
        display.drawImage(this.assetType, this.tilesX - 0.5, this.tilesY - 0.5, this.rotation);
    }

    displayHealh(display)
    {
        if (!this.gotHit())
        {
            //return;
        }

        const x = this.tilesX - this.barLengthXCoef/2;
        const y = this.tilesY + this.barShiftYCoef;
        const healthLengthX = this.hp/this.maxHp * this.barLengthXCoef; 
       
        // display health bar
        display.fillRect(x, y, healthLengthX, this.barWidthCoef, this.getHealthFillStyle());

        // display frame
        display.strokeRect(x, y, this.barLengthXCoef, this.barWidthCoef, this.healthBarStrokeStyle, this.healthBarStrokeWidth);
    }

    getHealthFillStyle()
    {
        if (this.hp/this.maxHp < 0.40)
        {
            return 'rgba(255, 0, 0, 1)'; // red
        }

        if (this.hp/this.maxHp < 0.70)
        {
            return 'rgba(255, 255, 0, 1)'; // yellow
        }

        return 'rgba(0, 255, 0, 1)'; // light green
    }

    gotHit()
    {
        return this.hp < this.maxHp;
    }

    display(display)
    {
        if (this.destroyed)
        {
            return;
        }

        this.displayModel(display);
        this.displayHealh(display);
    }

    hit(damage)
    {
        if (this.hp <= damage)
        {
            this.hp = 0;
            this.destroy();
            return;
        }

        this.hp -= damage;
    }
}