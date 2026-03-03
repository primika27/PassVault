const response = await fetch("http://localhost:8000/api/generator");
const data = await response.json();
console.log(data);