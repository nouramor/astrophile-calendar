const EVENTS_API_URL = "https://raw.githubusercontent.com/nouramor/astrophile-calendar/main/events.json"; // Make sure events.json is in the same folder
const eventsSection = document.getElementById("eventsSection");
const loadButton = document.getElementById("loadEvents");

// Load events when button is clicked
loadButton.addEventListener("click", async () => {
  eventsSection.innerHTML = "<p>Loading events near you...</p>";

  try {
    const response = await fetch(EVENTS_API_URL);
    const events = await response.json();

    if (!navigator.geolocation) {
      // If geolocation is not supported
      displayEvents(events);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const nearby = events.filter((event) => {
          // If event has no location, show it anyway
          if (!event.lat || !event.lng) return true;

          const distance = getDistance(userLat, userLng, event.lat, event.lng);
          return distance <= 500; // in km
        });

        displayEvents(nearby);
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
      <h2>${event.name}</h2>
      <img src="${event.image}" alt="Event Icon">
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p>${event.description}</p>
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
