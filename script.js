const EVENTS_API_URL = "https://raw.githubusercontent.com/nouramor/astrophile-calendar/main/events.json";
const eventsSection = document.getElementById("eventsSection");
const loadButton = document.getElementById("loadEvents");

// Load events when button is clicked
loadButton.addEventListener("click", async () => {
  eventsSection.innerHTML = "<p>Loading events near you...</p>";

  try {
    // Load your static events first
    const response = await fetch(EVENTS_API_URL);
    const events = await response.json();

    if (!navigator.geolocation) {
      displayEvents(events);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Filter nearby static events (within 500 km)
        const nearby = events.filter((event) => {
          if (!event.lat || !event.lng) return true;
          const distance = getDistance(userLat, userLng, event.lat, event.lng);
          return distance <= 500; // km
        });

        // Fetch real-time ISS pass data from Open Notify
        try {
          const issResponse = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${userLat}&lon=${userLng}`);
          if (!issResponse.ok) throw new Error("ISS API error");

          const issData = await issResponse.json();
          if (issData.message === "success") {
            // Map ISS passes to event objects
            const issEvents = issData.response.map((pass, i) => ({
              name: `ISS Pass #${i + 1}`,
              image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg",
              date: new Date(pass.risetime * 1000).toISOString(),
              location: `Lat: ${userLat.toFixed(2)}, Lon: ${userLng.toFixed(2)}`,
              description: `Duration: ${pass.duration} seconds`
            }));

            // Combine static nearby + ISS events
            displayEvents([...nearby, ...issEvents]);
          } else {
            displayEvents(nearby);
          }
        } catch (err) {
          console.error("ISS API fetch failed", err);
          displayEvents(nearby);
        }
      },
      (error) => {
        console.warn("Geolocation failed, showing all events.", error);
        displayEvents(events);
      }
    );
  } catch (e) {
    console.error("Error loading events:", e);
    eventsSection.innerHTML = "<p>Failed to load events.</p>";
  }
});

// Display events on the page
function displayEvents(events) {
  if (events.length === 0) {
    eventsSection.innerHTML = "<p>No astronomical events nearby.</p>";
    return;
  }

  eventsSection.innerHTML = "";

  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event";

    card.innerHTML = `
      <img src="${event.image}" alt="Event Icon">
      <div>
        <h2>${event.name}</h2>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p>${event.description}</p>
      </div>
    `;

    eventsSection.appendChild(card);
  });
}

// Haversine formula to calculate distance between two lat/lng points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
