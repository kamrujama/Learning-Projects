import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-array-demo',
  templateUrl: './array-demo.component.html',
  styleUrls: ['./array-demo.component.css']
})
export class ArrayDemoComponent implements OnInit {

  valueName = "Hello"
  arrayDemo = ['First','Second',"Third"]
  // const checkbox = document.getElementById('checkbox') as HTMLInputElement | null
  constructor() { }


  checkMe(){
    if(this.arrayDemo.includes(this.valueName)){
      return true
    }
    return false
  }
  push(){
    if(!this.arrayDemo.includes(this.valueName)){
      this.arrayDemo.push(this.valueName)
      // this.checkMe()
    }
    
  }

  ngOnInit(): void {
  }

}
