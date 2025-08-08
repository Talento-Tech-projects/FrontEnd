import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Header } from '../header/header';
import { Hero } from '../hero/hero';
import { Features } from '../features/features';
import { Pricing } from '../pricing/pricing';
import { Team } from '../team/team';
import { Footer } from '../footer/footer';
import { Cta } from '../cta/cta';
import { Faq } from "../faq/faq";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    Hero,
    Features,
    Pricing,
    Team,
    Footer,
    Cta,
    Faq
],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements AfterViewInit {
  constructor(private route: ActivatedRoute) {

  }  
  
  ngAfterViewInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
  
}
