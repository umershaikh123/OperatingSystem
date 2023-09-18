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

function calculateSRTF() {
  const processes = [];
  const burstRemaining = [];
  const isCompleted = [];
  const numProcesses = parseInt(document.getElementById("numProcesses").value);

  for (let i = 1; i <= numProcesses; i++) {
    const arrivalTime = parseInt(
      document.getElementById(`arrivalTime${i}`).value
    );
    const burstTime = parseInt(
      document.getElementById(`executionTime${i}`).value
    );

    processes.push({
      pid: i,
      arrivalTime,
      burstTime,
      startTime: 0,
      completionTime: 0,
      turnaroundTime: 0,
      waitingTime: 0,
      responseTime: 0,
    });

    burstRemaining.push(processes[i - 1].burstTime);
    isCompleted.push(0);
  }

  // for (let i = 0; i < numProcesses; i++) {
  //   const arrivalTime = parseInt(
  //     prompt(`Enter arrival time of process ${i + 1}:`)
  //   )
  //   const burstTime = parseInt(prompt(`Enter burst time of process ${i + 1}:`))
  //   processes.push({
  //     pid: i + 1,
  //     arrivalTime,
  //     burstTime,
  //     startTime: 0,
  //     completionTime: 0,
  //     turnaroundTime: 0,
  //     waitingTime: 0,
  //     responseTime: 0,
  //   })
  //   burstRemaining.push(processes[i].burstTime)
  //   isCompleted.push(0)
  // }

  let currentTime = 0;
  let completed = 0;
  let prev = 0;
  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  let totalIdleTime = 0;

  while (completed !== numProcesses) {
    let idx = -1;
    let mn = 10000000;
    for (let i = 0; i < numProcesses; i++) {
      if (processes[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (burstRemaining[i] < mn) {
          mn = burstRemaining[i];
          idx = i;
        }
        if (burstRemaining[i] === mn) {
          if (processes[i].arrivalTime < processes[idx].arrivalTime) {
            mn = burstRemaining[i];
            idx = i;
          }
        }
      }
    }

    if (idx !== -1) {
      if (burstRemaining[idx] === processes[idx].burstTime) {
        processes[idx].startTime = currentTime;
        totalIdleTime += processes[idx].startTime - prev;
      }
      burstRemaining[idx] -= 1;
      currentTime++;
      prev = currentTime;

      if (burstRemaining[idx] === 0) {
        processes[idx].completionTime = currentTime;
        processes[idx].turnaroundTime =
          processes[idx].completionTime - processes[idx].arrivalTime;
        processes[idx].waitingTime =
          processes[idx].turnaroundTime - processes[idx].burstTime;
        processes[idx].responseTime =
          processes[idx].startTime - processes[idx].arrivalTime;

        totalTurnaroundTime += processes[idx].turnaroundTime;
        totalWaitingTime += processes[idx].waitingTime;
        totalResponseTime += processes[idx].responseTime;

        isCompleted[idx] = 1;
        completed++;
      }
    } else {
      currentTime++;
    }
  }

  let minArrivalTime = 10000000;
  let maxCompletionTime = -1;

  for (let i = 0; i < numProcesses; i++) {
    minArrivalTime = Math.min(minArrivalTime, processes[i].arrivalTime);
    maxCompletionTime = Math.max(
      maxCompletionTime,
      processes[i].completionTime
    );
  }

  const avgTurnaroundTime = totalTurnaroundTime / numProcesses;
  const avgWaitingTime = totalWaitingTime / numProcesses;
  const avgResponseTime = totalResponseTime / numProcesses;
  const cpuUtilization =
    ((maxCompletionTime - totalIdleTime) / maxCompletionTime) * 100;
  const throughput = numProcesses / (maxCompletionTime - minArrivalTime);

  const srtfTable = document.getElementById("srtfTable");
  srtfTable.innerHTML = `
    <tr>
      <th>Process</th>
      <th>Arrival Time</th>
      <th>Burst Time</th>
      <th>Start Time</th>
      <th>Completion Time</th>
      <th>Turnaround Time</th>
      <th>Waiting Time</th>
      <th>Response Time</th>
    </tr>
  `;

  for (let i = 0; i < numProcesses; i++) {
    srtfTable.innerHTML += `<tr>
                              <td>Process ${processes[i].pid}</td>
                              <td>${processes[i].arrivalTime}</td>
                              <td>${processes[i].burstTime}</td>
                              <td>${processes[i].startTime}</td>
                              <td>${processes[i].completionTime}</td>
                              <td>${processes[i].turnaroundTime}</td>
                              <td>${processes[i].waitingTime}</td>
                              <td>${processes[i].responseTime}</td>
                            </tr>`;
  }

  // Visualization dimensions
  const width = 1200;
  const height = 100;

  // Create an SVG element
  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create x-scale based on total time
  const xScale = d3
    .scaleLinear()
    .domain([0, maxCompletionTime])
    .range([0, width]);

  // Data for visualization
  const visualizationData = [];

  for (let i = 0; i < numProcesses; i++) {
    // Rest of the code to calculate processes' start and finish times...

    // Generate a random color for each process
    const randomColor = getRandomColor();

    visualizationData.push({
      process: processes[i].pid,
      startTime: processes[i].startTime,
      finishTime: processes[i].completionTime,
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
    .text((d) => `P${d.process}`)
    .attr("font-size", "14px")
    .attr("fill", "black");

  // Create x-axis
  const xAxis = d3.axisBottom(xScale);
  svg.append("g").attr("transform", `translate(0, 60)`).call(xAxis);

  const metricsDiv = document.getElementById("metrics");
  metricsDiv.innerHTML = `
    <h2>Metrics:</h2>
    <h3>Average Turnaround Time: ${avgTurnaroundTime}</h3>
    <h3>Average Waiting Time: ${avgWaitingTime}</h3>
    <h3>Average Response Time: ${avgResponseTime}</h3>
    <h3>CPU Utilization: ${cpuUtilization.toFixed(2)}%</h3>
    <h3>Throughput: ${throughput.toFixed(2)} process/unit time</h3>
  `;
}
