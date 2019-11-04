import { distance } from "./td-utils.js";

export class ICollider
{
    //
    // returns boolean - if there is a collition with object
    //
    collide(collider) {}
}

export class CircleCollider
{
    construct(gameObject, radius)
    {
        this.gameObject = gameObject;
        this.radius = radius;
    }

    collide(collider)
    {
        const dist = distance(this.gameObject.x, this.gameObject.y, collider.gameObject.x, collider.gameObject.y);
        return dist < (this.radius + collider.radius);
    }
} 