import { Component, Input } from "@angular/core";
import { ServerComponent } from "../server/server.component";
import { ServerModel } from "../server/server.model";


@Component({
    selector: "server-blueprint",
    templateUrl: "server-blueprint.component.html"
})
export class ServerBluePrint {
    type: string = 'server'
    name = "server 1"
    content = "Server Content"
    servers: ServerModel[] = [
        new ServerModel("server", "Hello Server ", "Content")
    ]

    constructor() { }

    ngOnInit(): void {
    }


}
