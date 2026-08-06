// Let's test the logic
const safeParseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch(e) { return []; }
};

let itinerary = safeParseArray('[]'); // simulates fetching from DB

console.log("Initial state:", itinerary);

// User clicks add
itinerary = [...itinerary, {title:'', content:''}];

console.log("After add:", itinerary);

// User types
const copy = [...itinerary];
copy[0]['content'] = 'Hello';

console.log("After edit:", copy);
