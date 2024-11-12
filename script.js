
        // Replace with your actual Mapbox access token
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpZmEzMyIsImEiOiJjbTFienRma3AwZ3MyMmtzNmNya25scW9pIn0.ljsIhCngYnGHG7rua8Ah_g';

        // Initialize the map
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0], // Initial map center
            zoom: 2,
            projection : 'globe'
        });


// Add globe rotation when dragging
map.dragRotate.enable();
        map.touchZoomRotate.enableRotation();

        // Set the globe terrain to have real curvature
        map.on('style.load', () => {
            map.setFog({
                'range': [-1, 2],
                'horizon-blend': 0.1
            });
        });


        // Add traffic layer functionality
        let trafficVisible = false;
        function toggleTraffic() {
            trafficVisible = !trafficVisible;
            map.setStyle(trafficVisible ? 'mapbox://styles/mapbox/traffic-night-v2' : 'mapbox://styles/mapbox/streets-v11');
        }

        // Initialize the Directions API plugin
        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving'
        });

        map.addControl(directions, 'top-left'); // Add directions control to map

        // Search for directions based on the start and end location
        function searchDirections() {
            const startLocation = document.getElementById('start').value.trim();
            const endLocation = document.getElementById('end').value.trim();

            if (!startLocation || !endLocation) {
                alert('Please enter both starting and ending locations.');
                return;
            }

            // Add origin and destination to the directions API
            directions.setOrigin(startLocation);
            directions.setDestination(endLocation);

            // Fetch the route data using Mapbox Directions API
            fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(startLocation)};${encodeURIComponent(endLocation)}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
                .then(response => response.json())
                .then(routeData => {
                    const route = routeData.routes[0];
                    const distance = (route.distance / 1000).toFixed(2); // Convert to kilometers
                    const duration = (route.duration / 60).toFixed(2); // Convert to minutes
                    document.getElementById('info').innerHTML = `
                        <strong>Distance:</strong> ${distance} km<br>
                        <strong>Estimated Time:</strong> ${duration} minutes
                    `;
                    // Display nearby places along the route
                    const [lng, lat] = route.geometry.coordinates[0]; // Get coordinates
                    showNearbyPlaces(lng, lat); // Show nearby places
                })
                .catch(error => {
                    console.error('Error fetching directions:', error);
                    alert('An error occurred while fetching directions.');
                });
        }

        // Add compass and geolocate control to the map
        const nav = new mapboxgl.NavigationControl({
            visualizePitch: true // Shows a pitch indicator in compass
        });
        map.addControl(nav, 'top-right'); // Add compass

        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true, // Enable tracking user's current location
            showUserHeading: true // Shows direction where user is facing
        });
        map.addControl(geolocate, 'top-right'); // Add geolocate control next to compass

        // Start geolocate control automatically once the map loads
        map.on('load', () => {
            geolocate.trigger();
        });
    



