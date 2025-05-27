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
    this.currentUser = this.getCurrentUser();
    this.userCollectionPoints = [];
    this.userAgendas = [];
    
    this.init();  }
  
  // Obter usuário atualmente logado
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('usuarioLogado');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter usuário logado:', error);
      return null;
    }
  }
    async init() {
    this.setupSidebar();
    await this.loadAllData();
    this.loadUserCollectionPoints();
    this.loadUserAgendas();
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
      });    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados do servidor');
    }
  }

  // Filtrar pontos de coleta do usuário logado
  loadUserCollectionPoints() {
    if (!this.currentUser) {
      console.warn('Usuário não está logado');
      this.userCollectionPoints = [];
      return;
    }

    this.userCollectionPoints = this.pontosDeColeta.filter(ponto => 
      ponto.criadoPor === this.currentUser.id
    );

    console.log(`Pontos de coleta do usuário ${this.currentUser.nome}:`, this.userCollectionPoints.length);
  }

  // Carregar todas as agendas dos pontos de coleta do usuário
  loadUserAgendas() {
    this.userAgendas = [];
    
    this.userCollectionPoints.forEach(ponto => {
      if (ponto.agenda && ponto.agenda.length > 0) {
        ponto.agenda.forEach(agenda => {
          this.userAgendas.push({
            ...agenda,
            pontoColetaId: ponto.id,
            pontoColetaNome: ponto.nome,
            pontoColetaEndereco: ponto.endereco
          });
        });
      }
    });

    console.log(`Total de agendas do usuário:`, this.userAgendas.length);
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
    });  }
  
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

    // Navigation setup
    this.setupNavigation();    // Modal de criação de ponto de coleta
    this.setupModalEventListeners();

    // Navigation setup
    this.setupNavigation();

    // Agendas event listeners
    this.setupAgendasEventListeners();
  }

  // Configuração dos event listeners do modal
  setupModalEventListeners() {
    // Botão para abrir modal
    const openModalBtn = document.getElementById('areas-ativas-link');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Botão para fechar modal
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    // Botão cancelar
    const cancelModalBtn = document.getElementById('cancel-modal');
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener('click', () => this.closeModal());
    }

    // Fechar modal ao clicar fora
    const modalOverlay = document.getElementById('modal-novo-ponto');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }

    // Formulário de criação
    const form = document.getElementById('form-novo-ponto');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e);
      });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('cep-ponto');
    if (cepInput) {
      cepInput.addEventListener('input', this.formatCEP);
      cepInput.addEventListener('blur', this.searchAddressByCEP.bind(this));
    }

    // Máscara para telefone
    const phoneInput = document.getElementById('telefone-ponto');
    if (phoneInput) {
      phoneInput.addEventListener('input', this.formatPhone);
    }
  }

  // Controle do modal
  openModal() {
    const modal = document.getElementById('modal-novo-ponto');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    const modal = document.getElementById('modal-novo-ponto');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      this.resetForm();
    }
  }

  resetForm() {
    const form = document.getElementById('form-novo-ponto');
    if (form) {
      form.reset();
    }
  }

  // Máscara para CEP
  formatCEP(event) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    event.target.value = value;
  }

  // Máscara para telefone
  formatPhone(event) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    value = value.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
    event.target.value = value;
  }

  // Buscar endereço pelo CEP usando ViaCEP API
  async searchAddressByCEP(event) {
    const cep = event.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          this.showError('CEP não encontrado');
          return;
        }

        // Preencher campos automaticamente
        const enderecoInput = document.getElementById('endereco-ponto');
        const cidadeInput = document.getElementById('cidade-ponto');
        const estadoInput = document.getElementById('estado-ponto');

        if (enderecoInput) enderecoInput.value = `${data.logradouro}, ${data.bairro}`;
        if (cidadeInput) cidadeInput.value = data.localidade;
        if (estadoInput) estadoInput.value = data.uf;

      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        this.showError('Erro ao buscar informações do CEP');
      }
    }
  }

  // Manipular envio do formulário
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validar campos obrigatórios
    if (!this.validateForm(data)) {
      return;
    }

    // Obter materiais aceitos (checkboxes)
    const materiaisAceitos = Array.from(
      document.querySelectorAll('input[name="materiaisAceitos"]:checked')
    ).map(checkbox => checkbox.value);

    if (materiaisAceitos.length === 0) {
      this.showError('Selecione pelo menos um material aceito');
      return;
    }

    // Preparar dados do ponto de coleta
    const novoPonto = {
      nome: data.nome,
      endereco: `${data.endereco}, ${data.cidade} - ${data.estado}`,
      horario: data.horario,
      materiaisAceitos: materiaisAceitos,
      contato: data.contato,
      coletaDomiciliar: document.getElementById('coleta-domiciliar').checked,
      agenda: []
    };

    // Gerar coordenadas (simulação - em produção usaria geocoding API)
    const coordinates = await this.generateCoordinates(data.cidade, data.estado);
    novoPonto.lat = coordinates.lat;
    novoPonto.lng = coordinates.lng;

    try {
      // Salvar no banco
      await this.saveCollectionPoint(novoPonto);
      
      this.showSuccess('Ponto de coleta criado com sucesso!');
      this.closeModal();
      
      // Atualizar dashboard
      await this.refreshDashboard();
      
    } catch (error) {
      console.error('Erro ao criar ponto de coleta:', error);
      this.showError('Erro ao criar ponto de coleta. Tente novamente.');
    }
  }

  // Validar formulário
  validateForm(data) {
    const requiredFields = ['nome', 'cep', 'endereco', 'cidade', 'estado', 'contato', 'horario'];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        this.showError(`Campo ${field} é obrigatório`);
        return false;
      }
    }

    // Validar CEP
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(data.cep)) {
      this.showError('CEP deve ter formato válido (00000-000)');
      return false;
    }

    // Validar telefone
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(data.contato)) {
      this.showError('Telefone deve ter formato válido ((00) 00000-0000)');
      return false;
    }

    return true;
  }

  // Gerar coordenadas (simulação - em produção usaria Google Geocoding API)
  async generateCoordinates(cidade, estado) {
    // Coordenadas base para Betim, MG (região padrão)
    const baseLat = -19.9677;
    const baseLng = -44.1986;
    
    // Adicionar pequena variação aleatória para simular diferentes localizações
    const variation = 0.02;
    const lat = baseLat + (Math.random() - 0.5) * variation;
    const lng = baseLng + (Math.random() - 0.5) * variation;
    
    return { lat, lng };
  }

  // Salvar ponto de coleta no banco
  async saveCollectionPoint(pontoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/pontosDeColeta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pontoData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar ponto de coleta');
      }      const savedPoint = await response.json();
      return savedPoint;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Métodos de notificação
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Adicionar estilos inline se não estiverem no CSS
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    `;

    notification.querySelector('button').style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin: 0;
      line-height: 1;
    `;

    // Adicionar ao documento
    document.body.appendChild(notification);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }    }, 5000);
  }

  // ===== NAVIGATION METHODS =====
  
  setupNavigation() {
    // Handle navigation between sections
    const navLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.main-content');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const id = link.getAttribute('id');
          // Handle specific navigation items
        if (id === 'minhas-agendas-link') {
          e.preventDefault();
          this.showSection('minhas-agendas-section');
        }
        // You can add more navigation handlers here for other sections
      });
    });
  }
  showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.main-content');
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    // Update active navigation item
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`#${sectionId.replace('-section', '-link')}`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Load section-specific data
    if (sectionId === 'minhas-agendas-section') {
      this.renderUserCollectionPoints();
      this.loadAgendas();
    }
  }

  // ===== AGENDAS METHODS =====

  setupAgendasEventListeners() {
    // Refresh agendas button
    const refreshAgendasBtn = document.getElementById('refresh-agendas');
    if (refreshAgendasBtn) {
      refreshAgendasBtn.addEventListener('click', () => this.loadAgendas());
    }

    // Filter agendas
    const agendasFilter = document.getElementById('agendas-filter');
    if (agendasFilter) {
      agendasFilter.addEventListener('change', (e) => this.filterAgendas(e.target.value));
    }
  }
  async loadAgendas(filteredByPoint = null) {
    const container = document.getElementById('agendas-list');
    const loadingElement = document.querySelector('.agendas-loading');
    const emptyElement = document.querySelector('.agendas-empty');

    if (!container) return;

    // Show loading state
    container.innerHTML = '';
    if (loadingElement) loadingElement.style.display = 'flex';
    if (emptyElement) emptyElement.style.display = 'none';

    try {
      let agendasToShow = [];

      if (filteredByPoint) {
        // Show agendas only for a specific collection point
        const ponto = this.userCollectionPoints.find(p => p.id === filteredByPoint);
        if (ponto && ponto.agenda && ponto.agenda.length > 0) {
          agendasToShow = ponto.agenda.map(agenda => ({
            ...agenda,
            pontoColetaId: ponto.id,
            pontoColetaNome: ponto.nome,
            pontoColetaEndereco: ponto.endereco
          }));
        }
      } else {
        // Show all user agendas
        agendasToShow = [...this.userAgendas];
      }

      // Sort agendas by date (newest first)
      agendasToShow.sort((a, b) => new Date(b.dataHoraInicio) - new Date(a.dataHoraInicio));

      // Update statistics
      this.updateAgendasStats(agendasToShow);

      // Render agendas
      this.renderAgendas(agendasToShow, filteredByPoint);

    } catch (error) {
      console.error('Erro ao carregar agendas:', error);
      this.showError('Erro ao carregar agendas');
    } finally {
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }
  updateAgendasStats(agendas) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalAgendas = agendas.length;
    const agendasHoje = agendas.filter(agenda => {
      const agendaDate = new Date(agenda.dataHoraInicio);
      agendaDate.setHours(0, 0, 0, 0);
      return agendaDate.getTime() === today.getTime();
    }).length;

    const agendasPendentes = agendas.filter(agenda => 
      agenda.status === 'agendado' || agenda.status === 'confirmado'
    ).length;

    const agendasConcluidas = agendas.filter(agenda => 
      agenda.status === 'concluido'
    ).length;

    // Update DOM elements
    const totalElement = document.getElementById('total-agendas');
    const hojeElement = document.getElementById('agendas-hoje');
    const pendentesElement = document.getElementById('agendas-pendentes');
    const concluidasElement = document.getElementById('agendas-concluidas');

    if (totalElement) totalElement.textContent = totalAgendas;
    if (hojeElement) hojeElement.textContent = agendasHoje;
    if (pendentesElement) pendentesElement.textContent = agendasPendentes;
    if (concluidasElement) concluidasElement.textContent = agendasConcluidas;
  }
  renderAgendas(agendas, filteredByPoint = null) {
    const container = document.getElementById('agendas-list');
    const emptyElement = document.querySelector('.agendas-empty');

    if (!container) return;

    if (agendas.length === 0) {
      container.innerHTML = '';
      if (emptyElement) {
        const emptyText = filteredByPoint 
          ? 'Nenhum agendamento encontrado para este ecoponto'
          : 'Nenhuma agenda encontrada';
        emptyElement.querySelector('.agendas-empty-text').textContent = emptyText;
        emptyElement.style.display = 'flex';
      }
      return;
    }

    if (emptyElement) emptyElement.style.display = 'none';

    let headerHTML = '';
    if (filteredByPoint) {
      const ponto = this.userCollectionPoints.find(p => p.id === filteredByPoint);
      headerHTML = `
        <div class="agendas-filter-header">
          <div class="filter-info">
            <h3>Agendas para: ${ponto.nome}</h3>
            <p>${ponto.endereco}</p>
          </div>
          <button class="btn-secondary" onclick="window.dashboardAdmin.showAllAgendas()">
            Ver Todas as Agendas
          </button>
        </div>
      `;
    }

    const agendasHTML = agendas.map(agenda => this.createAgendaHTML(agenda)).join('');
    container.innerHTML = headerHTML + agendasHTML;

    // Setup action buttons
    this.setupAgendaActions();
  }

  createAgendaHTML(agenda) {
    const startDate = new Date(agenda.dataHoraInicio);
    const endDate = new Date(agenda.dataHoraFim);
    
    const formattedDate = startDate.toLocaleDateString('pt-BR');
    const formattedTime = `${startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;

    const statusClass = agenda.status.toLowerCase();
    const statusText = this.getStatusText(agenda.status);

    const materiaisText = agenda.materiais.join(', ');

    return `
      <div class="agenda-item" data-agenda-id="${agenda.idAgenda}">
        <div class="agenda-main-info">
          <div class="agenda-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
            </svg>
          </div>          <div class="agenda-details">
            <h3 class="agenda-title">${agenda.descricao}</h3>
            <p class="agenda-subtitle">${agenda.pontoColetaNome}</p>
            <div class="agenda-meta">
              <span class="agenda-time">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                ${formattedDate} • ${formattedTime}
              </span>
              <span class="agenda-location">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                ${materiaisText}
              </span>
            </div>
          </div>
        </div>
        <div class="agenda-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="agenda-actions">
          <button class="agenda-action-btn" data-action="view" title="Ver detalhes">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          ${agenda.status === 'agendado' ? `
            <button class="agenda-action-btn primary" data-action="confirm" title="Confirmar agenda">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
          ` : ''}
          <button class="agenda-action-btn" data-action="edit" title="Editar agenda">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  getStatusText(status) {
    const statusMap = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'em-andamento': 'Em Andamento'
    };
    return statusMap[status] || status;
  }

  setupAgendaActions() {
    const actionButtons = document.querySelectorAll('.agenda-action-btn');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = button.getAttribute('data-action');
        const agendaItem = button.closest('.agenda-item');
        const agendaId = agendaItem.getAttribute('data-agenda-id');
        
        this.handleAgendaAction(action, agendaId);
      });
    });
  }

  handleAgendaAction(action, agendaId) {
    switch (action) {
      case 'view':
        this.viewAgendaDetails(agendaId);
        break;
      case 'confirm':
        this.confirmAgenda(agendaId);
        break;
      case 'edit':
        this.editAgenda(agendaId);
        break;
      default:
        console.log('Ação não implementada:', action);
    }
  }

  viewAgendaDetails(agendaId) {
    // Find the agenda
    let foundAgenda = null;
    let foundPonto = null;
    
    for (const ponto of this.pontosDeColeta) {
      if (ponto.agenda) {
        const agenda = ponto.agenda.find(a => a.idAgenda === agendaId);
        if (agenda) {
          foundAgenda = agenda;
          foundPonto = ponto;
          break;
        }
      }
    }

    if (foundAgenda && foundPonto) {
      // Create and show details modal
      this.showAgendaDetailsModal(foundAgenda, foundPonto);
    }
  }

  showAgendaDetailsModal(agenda, ponto) {
    const startDate = new Date(agenda.dataHoraInicio);
    const endDate = new Date(agenda.dataHoraFim);
    
    const modalHTML = `
      <div id="agenda-details-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Detalhes da Agenda</h2>
            <button id="close-agenda-modal" class="close-modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="agenda-detail-item">
              <strong>Descrição:</strong> ${agenda.descricao}
            </div>
            <div class="agenda-detail-item">
              <strong>Ponto de Coleta:</strong> ${ponto.nome}
            </div>
            <div class="agenda-detail-item">
              <strong>Data:</strong> ${startDate.toLocaleDateString('pt-BR')}
            </div>
            <div class="agenda-detail-item">
              <strong>Horário:</strong> ${startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} - ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
            </div>
            <div class="agenda-detail-item">
              <strong>Status:</strong> <span class="status-badge ${agenda.status}">${this.getStatusText(agenda.status)}</span>
            </div>
            <div class="agenda-detail-item">
              <strong>Materiais:</strong> ${agenda.materiais.join(', ')}
            </div>
            <div class="agenda-detail-item">
              <strong>Contato Responsável:</strong> ${agenda.contatoResponsavel}
            </div>
            ${agenda.observacoes ? `
              <div class="agenda-detail-item">
                <strong>Observações:</strong> ${agenda.observacoes}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('agenda-details-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close event
    const closeButton = document.getElementById('close-agenda-modal');
    const modal = document.getElementById('agenda-details-modal');
    
    closeButton.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  async confirmAgenda(agendaId) {
    try {
      // Find the ponto that contains this agenda
      let targetPonto = null;
      let targetAgendaIndex = -1;

      for (const ponto of this.pontosDeColeta) {
        if (ponto.agenda) {
          const agendaIndex = ponto.agenda.findIndex(a => a.idAgenda === agendaId);
          if (agendaIndex !== -1) {
            targetPonto = ponto;
            targetAgendaIndex = agendaIndex;
            break;
          }
        }
      }

      if (targetPonto && targetAgendaIndex !== -1) {
        // Update status to confirmed
        targetPonto.agenda[targetAgendaIndex].status = 'confirmado';

        // Update in the database
        const response = await fetch(`${API_BASE_URL}/pontosDeColeta/${targetPonto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(targetPonto)
        });

        if (response.ok) {
          this.showSuccess('Agenda confirmada com sucesso!');
          this.loadAgendas(); // Reload agendas
        } else {
          throw new Error('Erro ao confirmar agenda');
        }
      }
    } catch (error) {
      console.error('Erro ao confirmar agenda:', error);
      this.showError('Erro ao confirmar agenda');
    }
  }

  editAgenda(agendaId) {
    // For now, just show a message that editing is not implemented
    this.showNotification('Funcionalidade de edição será implementada em breve', 'info');
  }
  filterAgendas(filterValue) {
    // This would be implemented to filter the displayed agendas
    // For now, we'll just reload all agendas
    this.loadAgendas();
  }

  // Show agendas for a specific collection point
  showAgendasForCollectionPoint(pontoId) {
    this.loadAgendas(pontoId);
  }

  // Show all agendas
  showAllAgendas() {
    this.loadAgendas();
  }

  // Render collection points with "Ver Agenda" buttons
  renderUserCollectionPoints() {
    const container = document.getElementById('user-collection-points');
    if (!container) return;

    if (this.userCollectionPoints.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Você ainda não criou nenhum ecoponto.</p>
        </div>
      `;
      return;
    }

    const pointsHTML = this.userCollectionPoints.map(ponto => {
      const agendasCount = ponto.agenda ? ponto.agenda.length : 0;
      return `
        <div class="collection-point-item">
          <div class="point-info">
            <h4>${ponto.nome}</h4>
            <p>${ponto.endereco}</p>
            <span class="agendas-count">${agendasCount} agendamento(s)</span>
          </div>
          <button class="btn-primary" onclick="window.dashboardAdmin.showAgendasForCollectionPoint(${ponto.id})">
            Ver Agendas
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = pointsHTML;
  }

  // ...existing code...
}

// Inicializar dashboard quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardAdmin = new DashboardAdmin();
});
