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
        const dist = CircleCollider.distance(this.gameObject.x, this.gameObject.y, collider.gameObject.x, collider.gameObject.y);
        return dist < (this.radius + collider.radius);
    }

    static distance(x1, y1, x2, y2)
    {
        return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
    }
} 