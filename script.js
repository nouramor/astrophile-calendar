const eventsSection = document.getElementById("events");

// Sample astronomy events (you can later replace this with a real API)
const events = [
  {
    name: "Perseid Meteor Shower",
    date: "August 12, 2025",
    location: "Visible Worldwide",
  },
  {
    name: "Partial Lunar Eclipse",
    date: "September 7, 2025",
    location: "Europe, Asia, Africa",
  },
  {
    name: "Total Solar Eclipse",
    date: "August 23, 2026",
    location: "North Africa, Spain",
  }
];

function loadEvents() {
  eventsSection.innerHTML = ""; // clear placeholder

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event";
    card.innerHTML = `
      <h2>${event.name}</h2>
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Location:</strong> ${event.location}</p>
    `;
    card.style.background = "rgba(255, 255, 255, 0.1)";
    card.style.margin = "20px auto";
    card.style.padding = "20px";
    card.style.borderRadius = "10px";
    card.style.maxWidth = "400px";
    card.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.4)";
    eventsSection.appendChild(card);
  });
}

loadEvents();
