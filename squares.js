const canvas = document.getElementById("bg"); const ctx = canvas.getContext("2d"); let width, height, squareSize = 40, offsetX = 0, offsetY = 0;

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }

function draw() { ctx.clearRect(0, 0, width, height); for (let x = -squareSize + offsetX; x < width; x += squareSize) { for (let y = -squareSize + offsetY; y < height; y += squareSize) { ctx.strokeStyle = '#555'; ctx.strokeRect(x, y, squareSize, squareSize); } } }

function animate() { offsetX = (offsetX + 0.3) % squareSize; offsetY = (offsetY + 0.3) % squareSize; draw(); requestAnimationFrame(animate); }

resize(); animate(); window.addEventListener("resize", resize);
