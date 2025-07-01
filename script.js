const EVENTS_API_URL = "https://raw.githubusercontent.com/nouramor/astrophile-calendar/main/events.json";
const eventsSection = document.getElementById("eventsSection");
const loadButton = document.getElementById("loadEvents");

loadButton.addEventListener("click", async () => {
  eventsSection.innerHTML = "<p>Loading events near you...</p>";

  try {
    const response = await fetch(EVENTS_API_URL);
    const events = await response.json();

    if (!navigator.geolocation) {
      events.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort before display
      displayEvents(events);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Filter events within 500 km or with lat/lng == 0 (global)
        const nearby = events.filter((event) => {
          if (!event.lat || !event.lng || (event.lat === 0 && event.lng === 0)) return true;
          const distance = getDistance(userLat, userLng, event.lat, event.lng);
          return distance <= 500;
        });

        // Fetch ISS passes for user location
        try {
          const issResponse = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${userLat}&lon=${userLng}`);
          if (!issResponse.ok) throw new Error("ISS API error");

          const issData = await issResponse.json();
          if (issData.message === "success") {
            const issEvents = issData.response.map((pass, i) => ({
              name: `ISS Pass #${i + 1}`,
              image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg",
              date: new Date(pass.risetime * 1000).toISOString(),
              location: `Lat: ${userLat.toFixed(2)}, Lon: ${userLng.toFixed(2)}`,
              description: `Duration: ${pass.duration} seconds`
            }));

            const combinedEvents = [...nearby, ...issEvents];
            combinedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort by date
            displayEvents(combinedEvents);
          } else {
            nearby.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort by date
            displayEvents(nearby);
          }
        } catch (err) {
          console.error("ISS API fetch failed", err);
          nearby.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort by date
          displayEvents(nearby);
        }
      },
      (error) => {
        console.warn("Geolocation failed, showing all events.", error);
        events.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort before display
        displayEvents(events);
      }
    );
  } catch (e) {
    console.error("Error loading events:", e);
    eventsSection.innerHTML = "<p>Failed to load events.</p>";
  }
});

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
      <img src="${event.image}" alt="Event Icon" style="width: 100px; height: 100px;">
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

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
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
