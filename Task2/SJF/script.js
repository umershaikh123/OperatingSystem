function getInput() {
  const numProcesses = parseInt(document.getElementById("numProcesses").value)

  const processTable = document.getElementById("processTable")
  processTable.innerHTML = "" // Clear previous content

  let tableContent = "<tr><th>Process</th><th>Execution Time</th></tr>"

  for (let i = 1; i <= numProcesses; i++) {
    tableContent += `<tr>
                        <td>Process ${i}</td>
                        <td><input type="number" id="executionTime${i}" min="1" step="1"></td>
                      </tr>`
  }

  processTable.innerHTML = tableContent
  document.getElementById("processesInput").style.display = "block"
}

// Function to generate a random color
function getRandomColor() {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function calculateSJF() {
  const numProcesses = parseInt(document.getElementById("numProcesses").value)
  const processes = []

  for (let i = 1; i <= numProcesses; i++) {
    const executionTime = parseInt(
      document.getElementById(`executionTime${i}`).value
    )

    processes.push({ process: i, executionTime })
  }

  // Sort processes based on execution time (burst time)
  processes.sort((a, b) => a.executionTime - b.executionTime)

  // Calculate waiting time, turnaround time, start time, finish time, and utilization time
  let startTime = 0
  let totalTime = 0

  const sjfTable = document.getElementById("sjfTable")
  sjfTable.innerHTML =
    "<tr><th>Process</th><th>Start Time</th><th>Finish Time</th><th>Waiting Time</th><th>Turnaround Time</th><th>Utilization Time</th></tr>"

  // Data for visualization
  const visualizationData = []

  for (let i = 0; i < numProcesses; i++) {
    if (i > 0) {
      startTime = processes[i - 1].finishTime
    }

    const finishTime = startTime + processes[i].executionTime
    const turnaroundTime = finishTime
    const waitingTime = startTime
    const utilizationTime = processes[i].executionTime / turnaroundTime

    processes[i].startTime = startTime
    processes[i].finishTime = finishTime
    processes[i].turnaroundTime = turnaroundTime
    processes[i].waitingTime = waitingTime
    processes[i].utilizationTime = utilizationTime

    sjfTable.innerHTML += `<tr>
                              <td>Process ${processes[i].process}</td>
                              <td>${processes[i].startTime}</td>
                              <td>${processes[i].finishTime}</td>
                              <td>${processes[i].waitingTime}</td>
                              <td>${processes[i].turnaroundTime}</td>
                              <td>${(
                                processes[i].utilizationTime * 100
                              ).toFixed(2)}%</td>
                            </tr>`

    // Generate a random color for each process
    processes[i].color = getRandomColor()

    visualizationData.push({
      process: processes[i].process,
      startTime: processes[i].startTime,
      finishTime: processes[i].finishTime,
      color: processes[i].color,
    })

    totalTime += turnaroundTime
  }

  // Visualization dimensions
  const width = 1200
  const height = 100

  // Create an SVG element
  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // Create x-scale based on total time
  const xScale = d3.scaleLinear().domain([0, totalTime]).range([0, width])

  // Draw rectangles for each process
  svg
    .selectAll("rect")
    .data(visualizationData)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.startTime))
    .attr("y", 20)
    .attr("width", d => xScale(d.finishTime) - xScale(d.startTime))
    .attr("height", 30)
    .attr("fill", d => d.color)

  // Add labels for each process
  svg
    .selectAll("text")
    .data(visualizationData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.startTime) + 5)
    .attr("y", 40)
    .text(d => `P ${d.process}`)
    .attr("font-size", "12px")
    .attr("fill", "black")

  // Create x-axis
  const xAxis = d3.axisBottom(xScale)
  svg.append("g").attr("transform", `translate(0, 60)`).call(xAxis)
}
