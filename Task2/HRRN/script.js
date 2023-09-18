function getInput() {
  const numProcesses = parseInt(document.getElementById("numProcesses").value);

  const processTable = document.getElementById("processTable");
  processTable.innerHTML = ""; // Clear previous content

  let tableContent =
    "<tr><th>Process</th><th>Arrival Time</th><th>Execution Time</th></tr>";

  for (let i = 1; i <= numProcesses; i++) {
    tableContent += `<tr>
                        <td>Process ${i}</td>
                        <td><input type="number" id="arrivalTime${i}" min="0" step="1" class="input" ></td>
                        <td><input type="number" id="executionTime${i}" min="1" step="1" class="input" ></td>
                      </tr>`;
  }

  processTable.innerHTML = tableContent;
  document.getElementById("processesInput").style.display = "block";
  return false;
}

// Function to generate a random color
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function calculateHRRN() {
  const numProcesses = parseInt(document.getElementById("numProcesses").value);
  const processes = [];

  for (let i = 1; i <= numProcesses; i++) {
    const arrivalTime = parseInt(
      document.getElementById(`arrivalTime${i}`).value
    );
    const burstTime = parseInt(
      document.getElementById(`executionTime${i}`).value
    );
    processes.push({ name: `P${i}`, arrivalTime, burstTime });
  }

  // Sort processes by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = processes[0].arrivalTime;
  let completed = 0;
  const waitingTime = new Array(numProcesses).fill(0);
  const turnaroundTime = new Array(numProcesses).fill(0);
  const normalizedTurnaroundTime = new Array(numProcesses).fill(0);

  while (completed < numProcesses) {
    let highestRatio = -Infinity;
    let selectedProcess = null;

    for (let i = 0; i < numProcesses; i++) {
      if (!processes[i].completed && processes[i].arrivalTime <= currentTime) {
        const responseRatio =
          (currentTime - processes[i].arrivalTime + processes[i].burstTime) /
          processes[i].burstTime;

        if (responseRatio > highestRatio) {
          highestRatio = responseRatio;
          selectedProcess = i;
        }
      }
    }

    if (selectedProcess !== null) {
      waitingTime[selectedProcess] =
        currentTime - processes[selectedProcess].arrivalTime;
      currentTime += processes[selectedProcess].burstTime;
      turnaroundTime[selectedProcess] =
        currentTime - processes[selectedProcess].arrivalTime;
      normalizedTurnaroundTime[selectedProcess] =
        turnaroundTime[selectedProcess] / processes[selectedProcess].burstTime;
      processes[selectedProcess].completed = true;
      completed++;
    } else {
      currentTime++;
    }
  }

  // Display HRRN results in a table
  const hrrnTable = document.getElementById("hrrnTable");
  hrrnTable.innerHTML =
    "<tr><th>Process</th><th>Arrival Time</th><th>Burst Time</th><th>Waiting Time</th><th>Turnaround Time</th><th>Normalized TAT</th></tr>";

  for (let i = 0; i < numProcesses; i++) {
    hrrnTable.innerHTML += `<tr>
                              <td>${processes[i].name}</td>
                              <td>${processes[i].arrivalTime}</td>
                              <td>${processes[i].burstTime}</td>
                              <td>${waitingTime[i]}</td>
                              <td>${turnaroundTime[i]}</td>
                              <td>${normalizedTurnaroundTime[i]}</td>
                            </tr>`;
  }

  // Calculate average waiting time and average turnaround time
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  for (let i = 0; i < numProcesses; i++) {
    totalWaitingTime += waitingTime[i];
    totalTurnaroundTime += turnaroundTime[i];
  }

  const avgWaitingTime = totalWaitingTime / numProcesses;
  const avgTurnaroundTime = totalTurnaroundTime / numProcesses;

  // Display average metrics
  const metricsDiv = document.getElementById("metrics");
  metricsDiv.innerHTML = `<h2>Average Metrics</h2>
                          <h3>Average Waiting Time: ${avgWaitingTime}</h3>
                          <h3>Average Turnaround Time: ${avgTurnaroundTime}</h3>`;

  // Visualization dimensions
  const width = 1200;
  const height = 100;

  d3.select("#visualization svg").remove()

  // Create an SVG element for visualization
  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create x-scale based on total time
  const xScale = d3.scaleLinear().domain([0, currentTime]).range([0, width]);

  // Data for visualization
  const visualizationData = [];

  for (let i = 0; i < numProcesses; i++) {
    // Rest of the code to calculate processes' start and finish times...

    // Generate a random color for each process
    const randomColor = getRandomColor();

    visualizationData.push({
      process: processes[i].name,
      startTime: processes[i].arrivalTime,
      finishTime: processes[i].arrivalTime + processes[i].burstTime,
      color: randomColor,
    });
  }

  // Draw rectangles for each process
  svg
    .selectAll("rect")
    .data(visualizationData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.startTime))
    .attr("y", 20)
    .attr("width", (d) => xScale(d.finishTime) - xScale(d.startTime))
    .attr("height", 30)
    .attr("fill", (d) => d.color);

  // Add labels for each process
  svg
    .selectAll("text")
    .data(visualizationData)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.startTime) + 5)
    .attr("y", 40)
    .text((d) => `${d.process}`)
    .attr("font-size", "14px")
    .attr("fill", "black");

  // Create x-axis
  const xAxis = d3.axisBottom(xScale);
  svg.append("g").attr("transform", `translate(0, 60)`).call(xAxis);
}
