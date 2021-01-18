import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  melbourneCenter = [144.95853, -38.025498];
  basemap = "topo-vector"
  mapZoom = 10;
  title = 'TurismMelbourne';
  attractionType = "artwork";

  loged = false;

  ngOnInit() {}

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationStart) {
        if (event.url === "/map") {
          this.loged = true;
        }
      }
    });
  }
}