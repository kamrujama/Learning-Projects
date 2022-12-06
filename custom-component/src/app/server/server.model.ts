export class ServerModel {

    public name: string
    public content: string
    public type: string

    constructor(type: string, name: string, content: string) {
        this.type = type
        this.name = name
        this.content = content
    }

}