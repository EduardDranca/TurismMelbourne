require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/tasks/Locator",
    "esri/Graphic"
  ], function(Map, MapView, FeatureLayer, GraphicsLayer, Locator, Graphic) {
    var map = new Map({
        basemap: "topo-vector"
    });

    var melbourneCenter = [144.95853, -38.025498];

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: melbourneCenter,
        zoom: 10
    });
    
    var touristAttractionsLayer = new FeatureLayer({
        url: "https://services-eu1.arcgis.com/zci5bUiJ8olAal7N/arcgis/rest/services/OSM_Tourism_AU/FeatureServer"
    });
    var graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    function addGraphics(result) {
        graphicsLayer.removeAll();
        result.features.forEach(function (feature) {
            if (feature.attributes.name) {
                var contentStyle = "display: none;";
                if (feature.attributes.website) {
                    console.log(feature.attributes.website);
                    contentStyle = "";
                }
                var g = new Graphic({
                    geometry: feature.geometry,
                    attributes: feature.attributes,
                    symbol: {
                        type: "picture-marker",
                        url: "https://developers.arcgis.com/labs/images/bluepin.png",
                        width: "14px",
                        height: "26px"
                    },
                    popupTemplate: {
                    title: "{name}",
                    content: "<div style='" + contentStyle + "'><a href=\"" + feature.attributes.website + "\">Website</a></div>" + 
                    "<div class='button'>Add to favorites</div>"
                    }
                });
                graphicsLayer.add(g);
            }
        });
    }

    document.getElementById("tourism").addEventListener("change", function onSelect(event) {
        queryLayerByType(event.target.value);
    });

    
    function queryFeatureLayer(point, distance, spatialRelationship, sqlExpression) {
        var query = {
            geometry: point,
            distance: distance,
            spatialRelationship: spatialRelationship,
            outFields: ["*"],
            returnGeometry: true,
            where: sqlExpression
        };
        touristAttractionsLayer.queryFeatures(query).then(function (result) {
            addGraphics(result, true);
        });
    }

    function queryLayerByType(type) {
        var query = touristAttractionsLayer.createQuery();
        query.where = "tourism = '" + type + "'";
        query.outFields = ["*"];
        query.geometry = view.center;
        query.distance = Math.min(view.extent.height, view.extent.width) / 2;
        query.spatialRelationship = "intersects";
        touristAttractionsLayer.queryFeatures(query).then(function (result) {
            addGraphics(result, true);
        });
    }

    view.when(function () {
        queryFeatureLayer(view.center, 150, "intersects");
    });
    // view.on("click", function (event) {
    //     queryLayerByName("");
    // });
    // map.add(touristAttractionsLayer);
});