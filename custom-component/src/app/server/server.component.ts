import { Component, OnInit } from '@angular/core';
import { ServerModel } from './server.model';
import { ServerBluePrint } from '../server-blueprint/server-blueprint.component';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.css']
})
export class ServerComponent implements OnInit {

  element = {}

  constructor() {

  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  addServer() {

    this.servers.push({
      type: this.type,
      name: this.name,
      content: this.content
    })

  }
