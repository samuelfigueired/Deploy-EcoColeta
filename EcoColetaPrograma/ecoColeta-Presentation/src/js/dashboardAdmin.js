// Dashboard Administrativo - EcoColeta
// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Classe principal para gerenciar o dashboard
class DashboardAdmin {
  constructor() {
    this.usuarios = [];
    this.pontosDeColeta = [];
    this.donations = [];
    this.charts = {};
    
    this.init();
  }
  async init() {
    this.setupSidebar();
    await this.loadAllData();
    this.updateDashboardStats();
    this.renderCharts();
    this.renderDynamicLists();
    this.setupEventListeners();
  }

  // Configuração da sidebar
  setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const mainContent = document.getElementById("main-content");

    function toggleSidebar() {
      sidebar.classList.toggle("open");
      sidebarOverlay.classList.toggle("visible");
    }

    sidebarToggle?.addEventListener("click", toggleSidebar);
    sidebarOverlay?.addEventListener("click", toggleSidebar);

    // Ajuste responsivo
    const adjustLayout = () => {
      if (window.innerWidth < 768) {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("visible");
        mainContent.style.marginLeft = "0";
      } else {
        mainContent.style.marginLeft = `${sidebar.offsetWidth}px`;
      }
    };

    adjustLayout();
    window.addEventListener("resize", adjustLayout);
  }

  // Carregamento de dados da API
  async loadAllData() {
    try {
      const [usuariosRes, pontosRes, donationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios`),
        fetch(`${API_BASE_URL}/pontosDeColeta`),
        fetch(`${API_BASE_URL}/donations`)
      ]);

      this.usuarios = await usuariosRes.json();
      this.pontosDeColeta = await pontosRes.json();
      this.donations = await donationsRes.json();

      console.log('Dados carregados:', {
        usuarios: this.usuarios.length,
        pontosDeColeta: this.pontosDeColeta.length,
        donations: this.donations.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados do servidor');
    }
  }

  // Cálculo de estatísticas
  calculateStats() {
    const totalPontosColeta = this.pontosDeColeta.length;
    const totalColetores = this.usuarios.filter(u => u.tipoUsuario === 'coletor').length;
    const totalDoadores = this.usuarios.filter(u => u.tipoUsuario === 'doador').length;
    const totalDonations = this.donations.length;
    
    // Simular coletas feitas e pendentes baseado nos pontos de coleta
    const coletasFeitas = Math.floor(totalPontosColeta * 0.7); // 70% dos pontos já foram coletados
    const coletasPendentes = totalPontosColeta - coletasFeitas;

    // Pontos ativos (com coleta domiciliar)
    const pontosAtivos = this.pontosDeColeta.filter(p => p.coletaDomiciliar).length;

    return {
      totalPontosColeta,
      totalColetores,
      totalDoadores,
      totalDonations,
      coletasFeitas,
      coletasPendentes,
      pontosAtivos
    };
  }

  // Atualização dos cards do dashboard
  updateDashboardStats() {
    const stats = this.calculateStats();
    
    // Atualizar cards principais
    this.updateCard('total-pontos', stats.totalPontosColeta);
    this.updateCard('total-coletores', stats.totalColetores);
    this.updateCard('coletas-feitas', stats.coletasFeitas);
    this.updateCard('coletas-pendentes', stats.coletasPendentes);

    // Atualizar cards de materiais (baseado nos materiais aceitos pelos pontos)
    this.updateMaterialCards();
  }

  updateCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  updateMaterialCards() {
    const materialCount = {};
    
    // Contar materiais aceitos pelos pontos de coleta
    this.pontosDeColeta.forEach(ponto => {
      if (ponto.materiaisAceitos) {
        ponto.materiaisAceitos.forEach(material => {
          materialCount[material] = (materialCount[material] || 0) + 1;
        });
      }
    });

    // Mapear materiais para os cards
    const materialMapping = {
      'plastico': 'plastico-count',
      'papel': 'papel-count', 
      'vidro': 'vidro-count',
      'metal': 'metal-count',
      'eletronicos': 'eletronicos-count'
    };

    Object.entries(materialMapping).forEach(([material, elementId]) => {
      this.updateCard(elementId, materialCount[material] || 0);
    });
  }

  // Geração de dados para gráficos
  generateChartData() {
    // Dados mensais simulados baseados nos pontos de coleta
    const monthlyData = this.generateMonthlyData();
    
    // Dados de performance por região
    const performanceData = this.generatePerformanceData();

    return { monthlyData, performanceData };
  }

  generateMonthlyData() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const baseValue = this.pontosDeColeta.length * 3; // 3 coletas por ponto em média
    
    return months.map(month => ({
      name: month,
      value: Math.floor(baseValue + (Math.random() - 0.5) * baseValue * 0.3)
    }));
  }

  generatePerformanceData() {
    // Agrupar pontos por região baseado no endereço
    const regioes = {};
    
    this.pontosDeColeta.forEach(ponto => {
      const endereco = ponto.endereco || '';
      let regiao = 'Centro';
      
      if (endereco.includes('Alterosas')) regiao = 'Zona Norte';
      else if (endereco.includes('Industrial')) regiao = 'Zona Sul';
      else if (endereco.includes('Imbiruçu')) regiao = 'Zona Leste';
      
      regioes[regiao] = (regioes[regiao] || 0) + 1;
    });

    const colors = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B'];
    let colorIndex = 0;

    return Object.entries(regioes).map(([nome, value]) => ({
      name: nome,
      value: value * 10, // Multiplicar para simular coletas
      color: colors[colorIndex++ % colors.length]
    }));
  }
  // Renderização dos gráficos
  renderCharts() {
    const { monthlyData, performanceData } = this.generateChartData();
    
    this.renderMonthlyChart(monthlyData);
    this.renderPerformanceChart(performanceData);
  }

  // Renderização das listas dinâmicas
  renderDynamicLists() {
    this.renderPontosAtivosList();
    this.renderColetoresList();
  }

  renderPontosAtivosList() {
    const container = document.getElementById('pontos-ativos-list');
    if (!container) return;

    // Filtrar pontos ativos (com coleta domiciliar)
    const pontosAtivos = this.pontosDeColeta.filter(ponto => ponto.coletaDomiciliar);
    
    if (pontosAtivos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum ponto ativo encontrado</div>';
      return;
    }

    const listHTML = pontosAtivos.slice(0, 5).map(ponto => `
      <div class="point-item">
        <div class="point-info">
          <div class="point-header">
            <span class="point-name">${ponto.nome}</span>
            <span class="point-status active">Ativo</span>
          </div>
          <div class="point-details">
            <span class="point-address">${ponto.endereco}</span>
            <span class="point-materials">${ponto.materiaisAceitos ? ponto.materiaisAceitos.join(', ') : 'N/A'}</span>
          </div>
        </div>
        <div class="point-actions">
          <button class="btn-small">Ver Detalhes</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = listHTML;
  }

  renderColetoresList() {
    const container = document.getElementById('coletores-list');
    if (!container) return;

    const coletores = this.usuarios.filter(usuario => usuario.tipoUsuario === 'coletor');
    
    if (coletores.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum coletor encontrado</div>';
      return;
    }

    const listHTML = coletores.map(coletor => {
      // Simular estatísticas do coletor
      const coletasRealizadas = Math.floor(Math.random() * 100) + 50;
      const statusAtivo = Math.random() > 0.3; // 70% chance de estar ativo
      
      return `
        <div class="collector-item">
          <div class="collector-info">
            <div class="collector-header">
              <span class="collector-name">${coletor.nome}</span>
              <span class="collector-status ${statusAtivo ? 'active' : 'inactive'}">
                ${statusAtivo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div class="collector-details">
              <span class="collector-email">${coletor.email}</span>
              <span class="collector-stats">${coletasRealizadas} coletas realizadas</span>
            </div>
          </div>
          <div class="collector-actions">
            <button class="btn-small">Ver Perfil</button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = listHTML;
  }

  renderMonthlyChart(data) {
    const ctx = document.getElementById("monthly-chart");
    if (!ctx) return;

    const chartCtx = ctx.getContext("2d");
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

    this.charts.monthly = new Chart(chartCtx, {
      type: "line",
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          label: "Coletas",
          data: data.map(item => item.value),
          fill: true,
          backgroundColor: gradient,
          borderColor: "#10B981",
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        elements: {
          line: { borderWidth: 2 },
        },
      },
    });
  }

  renderPerformanceChart(data) {
    const ctx = document.getElementById("performance-chart");
    if (!ctx) return;

    this.charts.performance = new Chart(ctx.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color),
          borderWidth: 0,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
      },
    });
  }

  // Event listeners para filtros e atualizações
  setupEventListeners() {
    // Botão de atualização
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshDashboard());
    }

    // Filtros de período (se existirem)
    const periodFilter = document.getElementById('period-filter');
    if (periodFilter) {
      periodFilter.addEventListener('change', (e) => this.filterByPeriod(e.target.value));
    }
  }

  // Atualização completa do dashboard
  async refreshDashboard() {
    try {
      await this.loadAllData();
      this.updateDashboardStats();
      
      // Destruir gráficos existentes
      Object.values(this.charts).forEach(chart => chart.destroy());
      this.charts = {};
        // Renderizar novamente
      this.renderCharts();
      this.renderDynamicLists();
      
      this.showSuccess('Dashboard atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
      this.showError('Erro ao atualizar dashboard');
    }
  }

  // Filtros por período
  filterByPeriod(period) {
    // Implementar filtro por período quando houver dados de data
    console.log('Filtro por período:', period);
  }

  // Métodos auxiliares para notificações
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Criar notificação simples
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      z-index: 1000;
      transition: opacity 0.3s;
      background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Métodos para exportar dados (para relatórios)
  exportData(format = 'json') {
    const data = {
      usuarios: this.usuarios,
      pontosDeColeta: this.pontosDeColeta,
      donations: this.donations,
      stats: this.calculateStats(),
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      this.downloadJSON(data, 'dashboard-report.json');
    }
  }

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Inicializar dashboard quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardAdmin = new DashboardAdmin();
});
