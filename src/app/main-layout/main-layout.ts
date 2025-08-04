import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Header } from '../header/header';
import { Hero } from '../hero/hero';
import { Features } from '../features/features';
import { Pricing } from '../pricing/pricing';
import { Team } from '../team/team';
import { Footer } from '../footer/footer';
import { Cta } from '../cta/cta';

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
    Cta
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  
}
