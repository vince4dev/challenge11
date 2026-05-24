// Messages error friendly
const HTTP_ERROR_MESSAGES = {
  400: "Invalid request. Please check your information.",
  401: "Access denied. Please log in.",
  403: "Access denied. You do not have the necessary permissions.",
  404: "Data not found. The JSON file was not found.",
  408: "Request timed out. Please try again.",
  500: "Internal server error. We are working to resolve it.",
  502: "Server currently unavailable. Please try again later.",
  503: "Service temporarily unavailable. Please wait.",
  504: "The server is taking too long to respond. Please refresh.",
};

// JSON file URL
const JSON_URL = "./assets/data/data.json";

const loadingModal = document.getElementById("loadingModal");
const status = document.getElementById("status");
const buttons = document.querySelectorAll("[data-period]");

// Dynamic extraction of categories from HTML
const categoryMap = {};
document.querySelectorAll("[data-category]").forEach((el) => {
  const key = el.dataset.category.toLowerCase().replace(/[\s_-]+/g, "");
  categoryMap[key] = el;
});

// Current period
let currentPeriod = "daily";
let jsonData = null;

// Error message handling
function getFriendlyErrorMessage(statusCode, statusText) {
  return (
    HTTP_ERROR_MESSAGES[statusCode] ||
    `Erreur ${statusCode} : ${statusText || "An unexpected error has occurred."}`
  );
}

// Display the modal
function showLoading() {
  loadingModal.classList.add("active");
}
// Hide the modal
function hideLoading() {
  loadingModal.classList.remove("active");
}

// Main function to load data
async function fetchData() {
  // Show loadimg modal
  showLoading();

  try {
    const response = await fetch(JSON_URL);

    if (!response.ok) {
      const status = response.status;
      const friendlyMsg = getFriendlyErrorMessage(status, response.statusText);
      throw new Error(friendlyMsg);
    }

    jsonData = await response.json();

    updateUI(currentPeriod);
  } catch (error) {
    // Distinguishing between network errors and server errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      status.textContent =
        "Unable to connect to the server. Check your internet connection.";
    } else {
      status.textContent = `Error : ${error.message}`;
    }
  } finally {
    // Hide loading modal
    if (status.textContent === "Loading...") {
      hideLoading();
    }
  }
}

// Interface Update
function updateUI(period) {
  // Ignore if data not found
  if (!jsonData) return;

  // Updates the active button
  buttons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.period === period),
  );

  // Updates each map according to the JSON data
  jsonData.forEach((item) => {
    // The JSON key must correspond to a data category in the HTML
    const categoryKey = item.title.toLowerCase().replace(/[\s_-]+/g, "");
    const cardElement = categoryMap[categoryKey];

    // Ignore if the category does not exist in the HTML
    if (!cardElement) return;

    const timeData = item.timeframes?.[period];
    // Ignore if period is not found
    if (!timeData) return;

    const currentVal = timeData.current;
    const previousVal = timeData.previous;

    const pEl = cardElement.querySelector(".card__stats p");
    const spanEl = cardElement.querySelector(".card__stats span");

    if (pEl && spanEl) {
      pEl.textContent = `${currentVal}hrs`;
      spanEl.textContent = `${period === "daily" ? "Yesterday" : period === "weekly" ? "Last Week" : "Last Month"} - ${previousVal}hrs`;
    }
  });
}

// listener on buttons
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const newPeriod = btn.dataset.period;
    currentPeriod = newPeriod;
    updateUI(currentPeriod);
  });
});

// Initial load
fetchData();
