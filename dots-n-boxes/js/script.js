const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 5; // Number of dots in each direction
const dotSize = 10;
const boxSize = 100;
let lines = [];
let boxes = [];
let currentPlayer = 1; // Player 1 starts
let hoverLine = null; // Temporary line for hover projection

function drawDots() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.beginPath();
            ctx.arc(i * boxSize + dotSize, j * boxSize + dotSize, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fill();
        }
    }
}

function drawLines() {
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = line.player === 1 ? 'blue' : 'red';
        ctx.stroke();
    });
}

function drawBoxes() {
    boxes.forEach(box => {
        // Fill the box with the player's color
        ctx.fillStyle = box.player === 1 ? 'rgba(0, 0, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(box.x, box.y, boxSize, boxSize);

        // Draw the box border
        //ctx.strokeStyle = 'black';
        //ctx.strokeRect(box.x, box.y, boxSize, boxSize);
    });
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Snap the mouse position to the nearest dot
    const col = Math.round((x - dotSize) / boxSize);
    const row = Math.round((y - dotSize) / boxSize);

    // Calculate the snapped dot position
    const snappedX = col * boxSize + dotSize;
    const snappedY = row * boxSize + dotSize;

    // Determine if the line is horizontal or vertical
    let tempLine = null;
    if (Math.abs(snappedX - x) < boxSize / 2 && Math.abs(snappedY - y) < boxSize / 2) {
        if (Math.abs(x - snappedX) > Math.abs(y - snappedY)) {
            // Horizontal line
            if (col < gridSize - 1) {
                tempLine = {
                    start: { x: snappedX, y: snappedY },
                    end: { x: snappedX + boxSize, y: snappedY },
                    player: currentPlayer
                };
            }
        } else {
            // Vertical line
            if (row < gridSize - 1) {
                tempLine = {
                    start: { x: snappedX, y: snappedY },
                    end: { x: snappedX, y: snappedY + boxSize },
                    player: currentPlayer
                };
            }
        }
    }

    // Check if the line is valid and not already drawn
    if (tempLine && !lines.some(l => l.start.x === tempLine.start.x && l.start.y === tempLine.start.y && l.end.x === tempLine.end.x && l.end.y === tempLine.end.y)) {
        hoverLine = tempLine;
    } else {
        hoverLine = null;
    }

    draw(); // Redraw the canvas to show the hover projection
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Snap the click position to the nearest dot
    const col = Math.round((x - dotSize) / boxSize);
    const row = Math.round((y - dotSize) / boxSize);

    // Calculate the snapped dot position
    const snappedX = col * boxSize + dotSize;
    const snappedY = row * boxSize + dotSize;

    // Determine if the line is horizontal or vertical
    let line = null;
    if (Math.abs(snappedX - x) < boxSize / 2 && Math.abs(snappedY - y) < boxSize / 2) {
        if (Math.abs(x - snappedX) > Math.abs(y - snappedY)) {
            // Horizontal line
            if (col < gridSize - 1) {
                line = {
                    start: { x: snappedX, y: snappedY },
                    end: { x: snappedX + boxSize, y: snappedY },
                    player: currentPlayer
                };
            }
        } else {
            // Vertical line
            if (row < gridSize - 1) {
                line = {
                    start: { x: snappedX, y: snappedY },
                    end: { x: snappedX, y: snappedY + boxSize },
                    player: currentPlayer
                };
            }
        }
    }

    // Check if the line is valid and not already drawn
    if (line && !lines.some(l => l.start.x === line.start.x && l.start.y === line.start.y && l.end.x === line.end.x && l.end.y === line.end.y)) {
        lines.push(line);

        // Check for completed boxes
        const completedBoxes = [];
        for (let i = 0; i < gridSize - 1; i++) {
            for (let j = 0; j < gridSize - 1; j++) {
                const boxLines = [
                    { start: { x: i * boxSize + dotSize, y: j * boxSize + dotSize }, end: { x: (i + 1) * boxSize + dotSize, y: j * boxSize + dotSize } },
                    { start: { x: (i + 1) * boxSize + dotSize, y: j * boxSize + dotSize }, end: { x: (i + 1) * boxSize + dotSize, y: (j + 1) * boxSize + dotSize } },
                    { start: { x: i * boxSize + dotSize, y: (j + 1) * boxSize + dotSize }, end: { x: (i + 1) * boxSize + dotSize, y: (j + 1) * boxSize + dotSize } },
                    { start: { x: i * boxSize + dotSize, y: j * boxSize + dotSize }, end: { x: i * boxSize + dotSize, y: (j + 1) * boxSize + dotSize } }
                ];
                if (boxes.some(box => box.x === i * boxSize + dotSize && box.y === j * boxSize + dotSize)) {
                    continue;
                }
                if (boxLines.every(line => lines.some(l => l.start.x === line.start.x && l.start.y === line.start.y && l.end.x === line.end.x && l.end.y === line.end.y))) {
                    if (!boxes.some(box => box.x === i * boxSize && box.y === j * boxSize)) {
                        completedBoxes.push({ x: i * boxSize + dotSize, y: j * boxSize + dotSize, player: currentPlayer });
                    }
                }
            }
        }

        // Add completed boxes to the boxes array
        completedBoxes.forEach(box => {
            boxes.push(box);
        });

        // If no boxes were completed, switch players
        if (completedBoxes.length === 0) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
    }

    draw();

    // Check for game over condition
    if (lines.length === (gridSize - 1) * gridSize * 2) {
        const player1Boxes = boxes.filter(box => box.player === 1).length;
        const player2Boxes = boxes.filter(box => box.player === 2).length;

        if (player1Boxes > player2Boxes) {
            alert(`Game Over! Player 1 wins with ${player1Boxes} boxes!`);
        } else if (player2Boxes > player1Boxes) {
            alert(`Game Over! Player 2 wins with ${player2Boxes} boxes!`);
        } else {
            alert(`Game Over! It's a tie with ${player1Boxes} boxes each!`);
        }
        // Reset game logic here
        lines = [];
        boxes = [];
        currentPlayer = 1;
        draw();
    }
});

function drawHoverLine() {
    if (hoverLine) {
        ctx.beginPath();
        ctx.moveTo(hoverLine.start.x, hoverLine.start.y);
        ctx.lineTo(hoverLine.end.x, hoverLine.end.y);
        ctx.strokeStyle = 'gray'; // Use a different color for the hover projection
        ctx.setLineDash([5, 5]); // Dashed line for projection
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawLines();
    drawBoxes();
    drawHoverLine(); // Draw the hover projection
}

draw();