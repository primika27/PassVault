const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const response = await fetch(`${API_BASE_URL}/api/generator`);
const data = await response.json();
console.log(data);