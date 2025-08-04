import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  
  scrollToSection(sectionId: string): void{
    const element = document.getElementById(sectionId);
    if (element && sectionId=="hero") {
      element.scrollIntoView({behavior: 'smooth', block:'center'});
    } else if (element) {
      element.scrollIntoView({behavior: 'smooth', block:'start'});
    }
  }
  
  isScrollingDown = false;
  private lastScrollY = 0;

  // Use @HostListener to listen for the window's scroll event
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Get the current vertical scroll position
    const currentScrollY = window.scrollY;

    // Check if the user is scrolling down
    if (currentScrollY > this.lastScrollY) {
      // Add a small delay to avoid triggering on minor scrolls
      if (currentScrollY > 100) {
        this.isScrollingDown = true;
      }
    } else {
      // Scrolling up, so show the header
      this.isScrollingDown = false;
    }

    // Update the last scroll position
    this.lastScrollY = currentScrollY;
  }
}
