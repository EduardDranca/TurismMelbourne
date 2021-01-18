import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { loadModules } from "esri-loader";
import esri = __esri; // Esri TypeScript Types

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit, OnDestroy {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  private _zoom = 10;
  private _center: Array<number> = [144.95853, -38.025498];
  private _basemap = "topo-vector";
  private _loaded = false;
  private _view: esri.MapView = null;
  private _layerUrl = "https://services-eu1.arcgis.com/zci5bUiJ8olAal7N/arcgis/rest/services/OSM_Tourism_AU/FeatureServer";
  private touristAttractionsLayer: esri.FeatureLayer = null;
  private graphicsLayer: esri.GraphicsLayer = null;
  private _attractionType = "artwork";

  get mapLoaded(): boolean {
    return this._loaded;
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: Array<number>) {
    this._center = center;
  }

  get center(): Array<number> {
    return this._center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  constructor() {}

  async initializeMap() {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, FeatureLayer, GraphicsLayer] = await loadModules([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer"
      ]);

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: this._basemap
      };
      
      const map: esri.Map = new EsriMap(mapProperties);

      this.touristAttractionsLayer = new FeatureLayer({
        url: this._layerUrl
      });
      this.graphicsLayer = new GraphicsLayer();
      map.add(this.graphicsLayer);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map: map
      };

      this._view = new EsriMapView(mapViewProperties);
      await this._view.when();
      this.queryLayerByType(this._attractionType);
      return this._view;
    } catch (error) {
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      // The map has been initialized
      this._loaded = this._view.ready;
      this.mapLoadedEvent.emit(true);
    });
  }

  async addGraphics(result) {
    try {
      const [Graphic, PictureMarkerSymbol, PopupTemplate] = await loadModules([
        "esri/Graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/PopupTemplate"
      ]);
      this.graphicsLayer.removeAll();
      result.features.forEach((feature) => {
        if (feature.attributes.name) {
          var contentStyle = "display: none;";
          var pictureMarker: esri.PictureMarkerSymbol = new PictureMarkerSymbol({
            url: "https://developers.arcgis.com/labs/images/bluepin.png",
            width: 10,
            height: 20
          });
  
          if (feature.attributes.website) {
            contentStyle = "";
          }

          var popupTemplate: esri.PopupTemplate = new PopupTemplate({
            title: feature.attributes.name,
            content:  "<div style='" + contentStyle + "'><a href=\"" + feature.attributes.website + "\">Website</a></div>" + 
            "<div class='button'>Add to favorites</div>"
          });

          var g: esri.Graphic = new Graphic({
            geometry: feature.geometry,
            attributes: feature.attributes,
            symbol: pictureMarker,
            popupTemplate: popupTemplate
          });
          this.graphicsLayer.add(g);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async queryFeatureLayer(point, distance, spatialRelationship, sqlExpression) {
    try {
      const [Query] = await loadModules([
        "esri/task/support/Query"
      ]);
      var query = new Query({
        geometry: point,
        distance: distance,
        spatialRelationship: spatialRelationship,
        outFields: ["*"],
        returnGeometry: true,
        where: sqlExpression
      });
      this.touristAttractionsLayer.queryFeatures(query).then((result) => {
        this.addGraphics(result);
      });
    } catch (error) {
      console.log(error);
    }
  }
  
  attractionSelect(event) {
    this._attractionType = event.target.value;
    if (this.touristAttractionsLayer) {
      this.queryLayerByType(this._attractionType);
    }
  }

  queryLayerByType(type) {
    var query = this.touristAttractionsLayer.createQuery();
    query.where = "tourism = '" + type + "'";
    query.outFields = ["*"];
    query.geometry = this._view.center;
    query.distance = Math.min(this._view.extent.height, this._view.extent.width) / 2;
    query.spatialRelationship = "intersects";
    this.touristAttractionsLayer.queryFeatures(query).then((result) => {
      this.addGraphics(result);
    });
  }

  ngOnDestroy() {
    if (this._view) {
      // destroy the map view
      this._view.container = null;
    }
  }
}
