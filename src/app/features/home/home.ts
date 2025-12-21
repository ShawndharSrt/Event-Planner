import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  services = [
    {
      title: 'Wedding Planning',
      description: 'Full-service planning for your special day, ensuring every detail is perfect.',
      icon: 'favorite'
    },
    {
      title: 'Event Design',
      description: 'Creating stunning visual experiences with bespoke decor and floral arrangements.',
      icon: 'palette'
    },
    {
      title: 'Coordination',
      description: 'Day-of coordination to ensure your event runs smoothly and stress-free.',
      icon: 'event_available'
    }
  ];

  portfolioImages = [
    { src: 'assets/images/wedding-hero.png', alt: 'Elegant Indoor Wedding' },
    { src: 'assets/images/wedding-guests-happy.png', alt: 'Outdoor Celebration' },
    { src: 'assets/images/wedding-hero.png', alt: 'Romantic Reception' }
  ];

  testimonials = [
    {
      name: 'Sarah & James',
      role: 'Wedding Couple',
      quote: 'Castella made our dream wedding a reality. Every detail was perfect!',
      image: 'assets/images/wedding-guests-happy.png' // Placeholder
    },
    {
      name: 'Emily R.',
      role: 'Event Host',
      quote: 'The team was incredibly professional and creative. Highly recommended!',
      image: 'assets/images/wedding-hero.png' // Placeholder
    },
    {
      name: 'Michael T.',
      role: 'Corporate Client',
      quote: 'Seamless coordination and stunning design. Our gala was a huge success.',
      image: 'assets/images/wedding-guests-happy.png' // Placeholder
    }
  ];
}

