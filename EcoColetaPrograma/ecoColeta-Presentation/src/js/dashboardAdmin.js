import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle functionality
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const sidebarOverlay = document.getElementById("sidebar-overlay")
  const mainContent = document.getElementById("main-content")

  function toggleSidebar() {
    sidebar.classList.toggle("open")
    sidebarOverlay.classList.toggle("visible")
  }

  sidebarToggle.addEventListener("click", toggleSidebar)
  sidebarOverlay.addEventListener("click", toggleSidebar)

  // Check if device is mobile
  function isMobile() {
    return window.innerWidth < 768
  }

  // Adjust layout based on screen size
  function adjustLayout() {
    if (isMobile()) {
      sidebar.classList.remove("open")
      sidebarOverlay.classList.remove("visible")
      mainContent.style.marginLeft = "0"
    } else {
      mainContent.style.marginLeft = `${sidebar.offsetWidth}px`
    }
  }

  // Initial layout adjustment
  adjustLayout()

  // Adjust layout on window resize
  window.addEventListener("resize", adjustLayout)

  // Chart data
  const monthlyData = [
    { name: "Jan", value: 210 },
    { name: "Fev", value: 220 },
    { name: "Mar", value: 198 },
    { name: "Abr", value: 230 },
    { name: "Mai", value: 247 },
  ]

  const performanceData = [
    { name: "Zona Sul", value: 42, color: "#10B981" },
    { name: "Zona Norte", value: 28, color: "#3B82F6" },
    { name: "Centro", value: 30, color: "#6366F1" },
  ]

  // Render monthly chart with Chart.js
  const monthlyChartCtx = document.getElementById("monthly-chart").getContext("2d")

  const gradient = monthlyChartCtx.createLinearGradient(0, 0, 0, 150)
  gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)")
  gradient.addColorStop(1, "rgba(16, 185, 129, 0)")

  new Chart(monthlyChartCtx, {
    type: "line",
    data: {
      labels: monthlyData.map((item) => item.name),
      datasets: [
        {
          label: "Coletas",
          data: monthlyData.map((item) => item.value),
          fill: true,
          backgroundColor: gradient,
          borderColor: "#10B981",
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      elements: {
        line: {
          borderWidth: 2,
        },
      },
    },
  })

  // Render performance chart with Chart.js
  const performanceChartCtx = document.getElementById("performance-chart").getContext("2d")

  new Chart(performanceChartCtx, {
    type: "doughnut",
    data: {
      labels: performanceData.map((item) => item.name),
      datasets: [
        {
          data: performanceData.map((item) => item.value),
          backgroundColor: performanceData.map((item) => item.color),
          borderWidth: 0,
          borderRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  })
})
