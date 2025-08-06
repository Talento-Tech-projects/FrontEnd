import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {

}
