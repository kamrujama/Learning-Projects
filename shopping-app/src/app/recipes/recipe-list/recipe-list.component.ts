import { Component, OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {

  recipeis:Recipe[] = [
    new Recipe("First Recipe", "Description of the first Recipe", "https://cdn.pixabay.com/photo/2016/02/02/15/33/dishes-1175493_1280.jpg"),
    new Recipe("Second Recipe", "Description of the Second Recipe", "https://cdn.pixabay.com/photo/2016/02/02/15/33/dishes-1175493_1280.jpg")
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
