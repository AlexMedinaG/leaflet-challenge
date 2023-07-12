//checking js loading
console.log('logic.js loaded');

//provided url for data
let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(url).then(data => {
    //create map
    let map = L.map('map').setView([0, 0], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    //access data.features
    let features = data.features;

    //define marker
    function getMarkerStyle(magnitude, depth) {
        return {
            radius: magnitude*2,
            fillColor: getColor(depth),
            color: '#000',
            weight: 1,
            fillOpacity: 0.5};}

    //define the color
    function getColor(depth) {
        let colorScale = d3.scaleLinear().domain([0,30,90]).range(['green','yellow', 'red']);
        return colorScale(depth);}

    //iteration 
    features.forEach(feature => {
        let properties = feature.properties;
        let coordinates = feature.geometry.coordinates;
        let latitude = coordinates[1];
        let longitude = coordinates[0];
        let depth = coordinates[2];
        //create marker and add it to the map
        let marker = L.circleMarker([latitude, longitude], getMarkerStyle(properties.mag, depth)).addTo(map);

        //populate popUp
        let popupContent = `
        <p>Place: ${properties.place}</p>
        <p>Time: ${new Date(properties.time)}</p>
        <p>Type: ${properties.type}</p>
        <p>Magnitude: ${properties.mag}</p>
        <p>Depth: ${depth}</p>`;
        marker.bindPopup(popupContent);});

    //make the legends
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'legend');

        //depth legend
        let depthRanges = [
            { min: 0, max: 10 },
            { min: 10, max: 30 },
            { min: 30, max: 50 },
            { min: 50, max: 70 },
            { min: 70, max: 90 },
            { min: 90, max: Infinity}];

        div.innerHTML += '<p>Depth</p>';
        depthRanges.forEach(range => {
        let color = getColor((range.min + range.max) / 2);
        let label = range.max === Infinity ? `${range.min}+` : `${range.min} to ${range.max}`;
        let style = `background-color:${color};width:15px;height:15px;display:inline-block;margin-right:5px;`;
        div.innerHTML += `<span style="${style}"></span>${label}`;});

        //magnitude legend
        let magnitudeRanges = [
            { min: 0, max: 3, size: 6 },
            { min: 3, max: 6, size: 9 },
            { min: 7, max: 10, size: 12 }];

        div.innerHTML += '<p>Magnitude</p>';
        magnitudeRanges.forEach(range => {
            let size = range.size;
            let label = `${range.min} to ${range.max}   `;
            let markerHtml = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000"></circle></svg>`;
        div.innerHTML += `${markerHtml}${label}`;});

    return div;};legend.addTo(map);})