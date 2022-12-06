import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

  childpower = ["super man", 'spider man', 'ant man']
  constructor() { }

  ngOnInit(): void {
  }

  @Input() public superuser: string | undefined;

  // @Input() public hero;

}
