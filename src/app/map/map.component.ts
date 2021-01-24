import { Favorite } from '../models/favorite';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnDestroy,
  Attribute
} from "@angular/core";
import { loadModules } from "esri-loader";
import esri = __esri; // Esri TypeScript Types
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';
import { MyAttribute } from '../models/attribute';

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
  private attractionsGraphicsLayer: esri.GraphicsLayer = null;
  private locationGraphicsLayer: esri.GraphicsLayer = null;
  private routeGraphicsLayer: esri.GraphicsLayer = null;
  private favoriteGraphicsLayer: esri.GraphicsLayer = null;
  private routeTask: esri.RouteTask = null;
  private search: any = null;
  private pickingLocation: Boolean = false;
  public pickingSuggestionLocation: Boolean = false;
  private locationGraphic: esri.Graphic = null;
  private attraction: Attraction;
  private customAttraction: Favorite;
  private attractions: any = {};

  public attractionWebsite = "";
  public attractionName = "";
  public attractionTypee = "";
  public suggestionLongitude = 144.95854;
  public suggestionLatitude = -38.025498;
  public suggestionWrapperToggled = false;
  public favoritePlaces: Favorite[] = [];
  public attractionType = "artwork";
  public address: String = "Pick your location on the map.";

  get mapLoaded(): boolean {
    return this._loaded;
  }

  constructor(private attractionService: AttractionService) {}

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then(mapView => {
      // The map has been initialized
      this._loaded = this._view.ready;
      this.mapLoadedEvent.emit(true);
    });
  }

  async initializeMap() {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [EsriMap, EsriMapView, FeatureLayer, GraphicsLayer, RouteTask, Search, Graphic] = await loadModules([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/tasks/RouteTask",
        "esri/widgets/Search",
        "esri/Graphic"
      ]);

      this.routeTask = new RouteTask({
        url: "https://utility.arcgis.com/usrsvcs/appservices/VtTobqWfJtatHNyP/rest/services/World/Route/NAServer/Route_World/solve"
      });

      // Configure the Map
      const mapProperties: esri.MapProperties = {
        basemap: this._basemap
      };
      
      const map: esri.Map = new EsriMap(mapProperties);

      this.touristAttractionsLayer = new FeatureLayer({
        url: this._layerUrl
      });
      this.attractionsGraphicsLayer = new GraphicsLayer();
      map.add(this.attractionsGraphicsLayer);

      this.locationGraphicsLayer = new GraphicsLayer();
      map.add(this.locationGraphicsLayer);

      this.routeGraphicsLayer = new GraphicsLayer();
      map.add(this.routeGraphicsLayer);

      this.favoriteGraphicsLayer = new GraphicsLayer();
      map.add(this.favoriteGraphicsLayer);

      // Initialize the MapView
      const mapViewProperties: esri.MapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this._center,
        zoom: this._zoom,
        map: map
      };

      this._view = new EsriMapView(mapViewProperties);
      this._view.on("click", event => {
        if (this.pickingLocation) {
          this.searchLocation(event.mapPoint);
        } else if (this.pickingSuggestionLocation) {
          this.suggestionLongitude = event.mapPoint.longitude;
          this.suggestionLatitude = event.mapPoint.latitude;
          this.toggleSuggestion(true);
        }
      });

      this._view.popup.on("trigger-action", (event) => {
        if (event.action.id === "get-route") {
          this.getRoute(this._view.popup.selectedFeature);
        }
        if (event.action.id === "add-favorite") {
          var selection = this.queryLayerByName(this._view.popup.title);
          this.addFavorite(selection);
        }
      });

      this.search = new Search({
        view: this._view
      });
      this.locationGraphic = new Graphic();

      this.queryLayerByType(this.attractionType);
      return this._view;
    } catch (error) {
      console.log(error);
    }
  }

  async addFavorite(selection) {
    selection = await selection;
    console.log(selection);
    var fav: Favorite = {
      geometry: selection.geometry,
      attributes: selection.attributes,
      type: "star"
    };
    this.favoritePlaces.push(fav);
  }

  locationButtonClickHandler(event) {
    this.pickingLocation = true;
  }

  searchLocation(point) {
    this.search.clear();
    this._view.popup.clear();
    if (this.search.activeSource) {
      var geocoder = this.search.activeSource.locator;
      var params = {
        location: point
      };
      geocoder.locationToAddress(params).then(
        response => {
          this.address = response.address;
          this.addLocationGraphic(point);
        },
        err => {
          console.log(err);
        }
      );
    }
    this.pickingLocation = false;
  }

  async addGraphic(type, point) {
    try {
      const [Graphic, SimpleMarkerSymbol] = await loadModules([
        "esri/Graphic",
        "esri/symbols/SimpleMarkerSymbol"
      ])
      var markerSymbol = new SimpleMarkerSymbol({
        color: type === "start" ? "white" : "black",
        size: "8px"
      });
      var g = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });
      this.attractionsGraphicsLayer.add(g)
    } catch (error) {
      console.log(error);
    }
  }

  async getRoute(destination) {
    try {
      const [RouteParameters, FeatureSet, SimpleLineSymbol] = await loadModules([
        "esri/tasks/support/RouteParameters",
        "esri/tasks/support/FeatureSet",
        "esri/symbols/SimpleLineSymbol"
      ]);
      var routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: [destination, this.locationGraphic]
        }),
        returnDirections: true
      });
      this.routeTask.solve(routeParams).then((data:any) => {
        data.routeResults.forEach(result => {
          result.route.symbol = new SimpleLineSymbol({
            color: [5, 150, 255],
            width: 3
          });
          this.routeGraphicsLayer.removeAll();
          this.routeGraphicsLayer.add(result.route);
        });
      });
    } catch (error) {
      console.log(error);
    }
  }


  async addLocationGraphic(point) {
    try {
      const [Graphic, PictureMarkerSymbol] = await loadModules([
        "esri/Graphic",
        "esri/symbols/PictureMarkerSymbol"
      ]);
      var pictureMarker: esri.PictureMarkerSymbol = new PictureMarkerSymbol({
        url: "https://i.imgur.com/R0ORNzA.png",
        width: 20,
        height: 20
      });
      this.locationGraphicsLayer.remove(this.locationGraphic);

      this.locationGraphic = new Graphic({
        geometry: point,
        symbol: pictureMarker
      });
      
      this.locationGraphicsLayer.add(this.locationGraphic);
    } catch (error) {
      console.log(error);
    }
  }

  async addTypeQueryGraphics(result) {
    // this.attractionsGraphicsLayer.removeAll();
    result.features.forEach(async (feature) => {
      if (feature.attributes.name) {
        var g = await this.createGraphicWithPopup(feature);
        this.attractionsGraphicsLayer.add(g);
      }
    });
  }
  
  async createGraphicWithPopup(favorite) {
    try {
      const [Graphic, PictureMarkerSymbol, PopupTemplate] = await loadModules([
        "esri/Graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/PopupTemplate"
      ]);
      var contentStyle = "display: none;";
      var pictureMarker: esri.PictureMarkerSymbol = new PictureMarkerSymbol({
        url: "https://developers.arcgis.com/labs/images/bluepin.png",
        width: 10,
        height: 20
      });

      if (favorite.attributes.website) {
        contentStyle = "";
      }

      var getRouteAction = {
        title: "Display Route",
        id: "get-route",
        image: "https://image.flaticon.com/icons/png/512/149/149054.png"
      }

      var addFavoriteAction = {
        title: "Add to Favorites",
        id: "add-favorite",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Love_Heart_symbol.svg/651px-Love_Heart_symbol.svg.png"
      }

      var popupTemplate: esri.PopupTemplate = new PopupTemplate({
        title: favorite.attributes.name,
        content:  "<div style='" + contentStyle + "'><a href=\"" + favorite.attributes.website + "\">Website</a></div>",
        actions: [getRouteAction, addFavoriteAction]
      });

      var g: esri.Graphic = new Graphic({
        geometry: favorite.geometry,
        attributes: favorite.attributes,
        symbol: pictureMarker,
        popupTemplate: popupTemplate
      });

      return g;
    } catch (error) {
      console.log(error);
    }
  }

  attractionSelect(event) {
    this.attractionType = event.value;
    if (this.touristAttractionsLayer) {
      this.queryLayerByType(this.attractionType);
    }
  }

  async clickFavorite(event, fav) {
    try {
      const [Point] = await loadModules([
        "esri/geometry/Point"
      ]);
      console.log(fav);
      var g = await this.createGraphicWithPopup(fav);
      this.favoriteGraphicsLayer.removeAll();
      this.favoriteGraphicsLayer.add(g);
      this._view.goTo({
        target: g,
        animate: true
      }).then(() => {
        this._view.popup.location = new Point(g.geometry);
        this._view.popup.open({features: [g]});
      });
    } catch (error) {
      console.log(error);
    }
  }

  queryLayerByType(type) {
    this.attractionsGraphicsLayer.removeAll();
    var query = this.touristAttractionsLayer.createQuery();
    query.where = "tourism = '" + type + "'";
    query.outFields = ["*"];
    query.geometry = this._view.center;
    query.distance = Math.min(this._view.extent.height, this._view.extent.width) / 2;
    query.spatialRelationship = "intersects";
    this.touristAttractionsLayer.queryFeatures(query).then((result) => {
      this.addTypeQueryGraphics(result);
    });
    this.showAttraction(type);
  }

  queryLayerByName(name) {
    var query = this.touristAttractionsLayer.createQuery();
    var nameEscaped: String = name;
    nameEscaped = nameEscaped.replace("'", "''");
    query.where = "name = '" + nameEscaped + "'";
    query.outFields = ["*"];
    return this.touristAttractionsLayer.queryFeatures(query).then((result) => {
      if (result.features.length !== 0) {
        return result.features[0];
      }
      return null;
    });
  }

  toggleSuggestion(toggled) {
    this.suggestionWrapperToggled = toggled;
  }

  chooseLocationOnMap() {
    this.toggleSuggestion(false);
    this.pickingSuggestionLocation = true;
  }

  submitAttraction() {
    this.attraction = new Attraction();    
    this.attraction.website = this.attractionWebsite;
    this.attraction.title = this.attractionName;
    this.attraction.type = this.attractionTypee;
    this.attraction.latitude = this.suggestionLatitude.toString();
    this.attraction.longitude = this.suggestionLongitude.toString();
    this.attraction.description = "-";
    this.attractionService.addAttraction(this.attraction).subscribe(() => { });
    this.toggleSuggestion(false);
  }

  async showAttraction(type: string) {
    try {

      const [Point] = await loadModules([
        "esri/geometry/Point"
      ]);

      // modific functia sa imi aduca doar pe type
      this.attractionService.getAttractionByType(type).subscribe(val => {
        val.forEach(async element => {
          this.customAttraction = new Favorite();
          this.customAttraction.attributes = new MyAttribute();
          this.customAttraction.attributes.website = element.website;
          this.customAttraction.attributes.description = element.description;
          this.customAttraction.attributes.name = element.title;
          this.customAttraction.type = element.type;
          this.customAttraction.geometry = new Point();
          this.customAttraction.geometry.latitude = element.latitude;
          this.customAttraction.geometry.longitude = element.longitude;
          this.attractionsGraphicsLayer.add(await this.createGraphicWithPopup(this.customAttraction))
       });
     });

    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    if (this._view) {
      // destroy the map view
      this._view.container = null;
    }
  }
}