const e = require('express')
var geojson = require('geojson-tools')

function compare( a: { timestamp: string | number | Date }, b: { timestamp: string | number | Date } ) {
    var d1 = new Date(a.timestamp)
    var d2 = new Date(b.timestamp)
    if(d1>d2)
        return -1
    else
        return 1
}

var convert = (coordinates: any)=>{
    var array = geojson.complexify(coordinates, 0.5)
    return geojson.toGeoJSON(array, 'LineString')
}

var parses = (data: { geometry: { type: any }; coordinates: any[]; properties: any })=>{
    return { 
        geometry:{type:data.geometry.type,coordinates:data.coordinates[0]},
        properties:data.properties ? data.properties : {}
    };
}

var parseGeo = (data: any)=>{
    return { 
        geometry:data.geometry,
        properties:data.properties ? data.properties : {}
    };
}

var parseNotifications = (email:String,datas: any[])=>{

    let result: any[] = []
    datas.forEach(element => {
        element.track.forEach((value: { timestamp: any; seenBy: any; _id: any; lat: any; lon: any; type: any; status: any }) => {
            var obj = {
              timestamp: value.timestamp,
              seen: value.seenBy.includes(email),
              _id: value._id,
              lat: value.lat,
              lon: value.lon,
              type: value.type,
              status: value.status,
              name: element.name,
              assetId: element._id
            }
            result.push(obj)
        });
    });

   result = result.sort(compare)
    if(result.length>100) {
        result = result.slice(0, 100)
    }
    return result
}

var parseNotification = (email:String,datas: { track: any[]; name: any; _id: any })=>{
    
    let result: any[] = []
    
        datas.track.forEach(value => {
            var obj = {
              timestamp: value.timestamp,
              seen:value.seenBy.includes(email),
              _id: value._id,
              lat: value.lat,
              lon: value.lon,
              type: value.type,
              status: value.status,
              name: datas.name,
              assetId: datas._id
            }
            result.push(obj)
        });
   

   result = result.sort(compare)
    if(result.length>100) {
        result = result.slice(0, 100)
    }
    return result
}

module.exports = [convert, parses, parseGeo, parseNotifications, parseNotification]