const stops = [
    { name: "Pintura", lat: 18.457813, lng: -69.975452 },
    { name: "Parque Independencia", lat: 18.471926, lng: -69.892040 }
];
const coordinatesStr = stops.map(s => `${s.lng},${s.lat}`).join(';');
const url = `http://router.project-osrm.org/route/v1/driving/${coordinatesStr}?overview=full&geometries=geojson`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log(data.code);
        if(data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates;
            console.log("Length:", coords.length);
            console.log("First coordinate:", coords[0]);
        }
    })
    .catch(console.error);
