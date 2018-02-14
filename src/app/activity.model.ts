import * as Guid from 'guid';

export class Activity {
    constructor(name: string, lengthInSeconds: number) {
        this.name = name;
        this.lengthInSeconds = lengthInSeconds;
        this.id = Guid.raw();
    }

    id: string;
    name: string;
    lengthInSeconds: number;
}
