import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  melbourneCenter = [144.95853, -38.025498];
  basemap = "topo-vector"
  mapZoom = 10;
  title = 'TurismMelbourne';
}
