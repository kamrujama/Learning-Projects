import { Component } from "@angular/core";


@Component({
    selector: "server-app",
    templateUrl: "server.component.html"
})

export class ServerComponent {

    count = 0;
    bgName = "danger"
    serverName = ""
    createdServer = false

    servers = ["Google"]

    addServer() {

        if (this.serverName.length > 0) {

            if (!this.servers.includes(this.serverName)){
                this.servers.push(this.serverName)
                this.count++;
            }
            console.log(this.servers)
            this.createdServer = true
        }
        else {
            this.createdServer = false
        }

    }

    deleteServer() {
        this.servers.pop();
        this.count--;
        if (this.servers.length === 0)
            this.createdServer = false;
    }

    deleteServerRandomly(id: number) {

        // this method can be used to delete the elements on click 
        // that is by taking the element index on click
        this.servers.splice(id, 1)
        if (this.servers.length === 0)
            this.createdServer = false
    }

    increment(event : any){
        if(event.target.checked){
            this.count++;
        }
        else{
            this.count--;
        }
            
    }


}