// detalhe-evento.js
// Carrega e exibe os detalhes do evento individual

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.body.innerHTML = '<p style="color:#c00;text-align:center;margin-top:40px">Evento não encontrado.</p>';
    return;
  }
  const API_BASE_URL = 'http://localhost:3000/api';
  let isAutor = false; // Corrige escopo para evitar ReferenceError
  let autor = {};
  try {
    const response = await fetch(`${API_BASE_URL}/eventos`);
    if (!response.ok) throw new Error('Erro ao buscar eventos');
    const eventos = await response.json();
    const evento = eventos.find(e => String(e.id) === String(id));
    if (!evento) {
      document.body.innerHTML = '<p style="color:#c00;text-align:center;margin-top:40px">Evento não encontrado.</p>';
      return;
    }
    // Simulação: usuário logado (troque para lógica real de autenticação)
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    autor = evento.autor || {};
    isAutor = usuarioLogado?.email && autor?.email && usuarioLogado.email === autor.email;
    // Banner
    const banner = document.getElementById('eventoBanner');
    banner.innerHTML = `<img src="${evento.imagem || 'assets/img/calendar.svg'}" alt="Banner do Evento" style="width:100%;max-height:320px;object-fit:cover;border-radius:16px 16px 0 0;">`;
    // Título
    document.getElementById('eventoTitulo').textContent = evento.titulo;
    // Data/hora formatados
    let dataFormatada = evento.data;
    if (evento.data && evento.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = evento.data.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
    }
    // Data e hora acima da descrição
    const dataHoraDiv = document.createElement('div');
    dataHoraDiv.className = 'evento-data-hora-row';
    dataHoraDiv.innerHTML = `
      <span class='editavel'><img src='assets/img/calendar.svg' alt='Data' class='icon-evento' style='width:20px;height:20px;margin-right:4px;vertical-align:middle;'><span id='dataEditavel' style='cursor:pointer;text-decoration:underline dotted;'>${dataFormatada}</span></span>
      <span class='editavel'>${evento.hora ? `<img src='assets/img/relogio.svg' alt='Hora' class='icon-evento' style='width:20px;height:20px;margin-right:4px;vertical-align:middle;'><span id='horaEditavel' style='cursor:pointer;text-decoration:underline dotted;'>${evento.hora}</span>` : ''}</span>
    `;
    const detalheContent = document.querySelector('.evento-detalhe-content');
    detalheContent.insertBefore(dataHoraDiv, document.getElementById('eventoDescricao'));
    // Status e botão excluir na mesma linha
    let status = '';
    let dataEvento = null;
    if (evento.data && evento.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dataEvento = new Date(`${evento.data}T${evento.hora || '00:00'}`);
    }
    if (dataEvento) {
      const agora = new Date();
      const fimEvento = new Date(dataEvento.getTime() + 2 * 60 * 60 * 1000); // 2h de duração
      if (agora < dataEvento) {
        status = '<span class="evento-status status-breve">Acontecerá em breve</span>';
      } else if (agora >= dataEvento && agora <= fimEvento) {
        status = '<span class="evento-status status-agora">Acontecendo agora</span>';
      } else {
        status = '<span class="evento-status status-finalizado">Evento finalizado</span>';
      }
    }
    const statusDiv = document.querySelector('.evento-status-data');
    if (isAutor) {
      statusDiv.innerHTML = `${status} <button id='btnExcluirEvento' class='btn-excluir-evento-inline' title='Excluir evento'><img src='assets/img/trash-can.svg' alt='Excluir' style='width:18px;height:18px;margin-right:4px;vertical-align:middle;'> Excluir evento</button>`;
    } else {
      statusDiv.innerHTML = status;
    }
    // Autor
    document.getElementById('eventoAutor').innerHTML = `
      <img src="${autor.foto || 'https://placehold.co/32'}" alt="${autor.nome || 'Autor'}" class="evento-autor-img" style="width:32px;height:32px;"> 
      <span class="evento-autor-nome">${autor.nome || 'Autor desconhecido'}</span>
      <span style='color:#888;font-size:0.95em;margin-left:8px;'>${autor.email || ''}</span>
    `;
    // Descrição
    document.getElementById('eventoDescricao').textContent = evento.descricao;

    // --- AÇÕES: editar/notificar ---
    const acoesDiv = document.getElementById('eventoAcoes');
    acoesDiv.innerHTML = '';
    if (!isAutor) {
      // Botão notificar
      acoesDiv.innerHTML += `<button id="btnNotificarEvento" class="btn-notificar-evento"><i class='fa fa-bell'></i> Quero ser notificado</button>`;
    }

    // Eventos dos botões
    if (isAutor) {
      document.getElementById('btnExcluirEvento').onclick = async () => {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
          await fetch(`${API_BASE_URL}/eventos/${evento.id}`, {method: 'DELETE'});
          alert('Evento excluído!');
          window.location.href = 'comunidade.html';
        }
      };
      // Edição inline da data/hora com input tipo date/hora
      const dataSpanEdit = document.getElementById('dataEditavel');
      const horaSpanEdit = document.getElementById('horaEditavel');
      if (dataSpanEdit) {
        dataSpanEdit.onclick = async () => {
          // Cria input date temporário
          const input = document.createElement('input');
          input.type = 'date';
          input.value = evento.data;
          input.style.fontSize = '1em';
          input.style.marginLeft = '8px';
          dataSpanEdit.replaceWith(input);
          input.focus();
          input.onblur = async () => {
            if (input.value && input.value !== evento.data) {
              await fetch(`${API_BASE_URL}/eventos/${evento.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({data: input.value})
              });
              location.reload();
            } else {
              input.replaceWith(dataSpanEdit);
            }
          };
        };
      }
      if (horaSpanEdit) {
        horaSpanEdit.onclick = async () => {
          // Cria input time temporário
          const input = document.createElement('input');
          input.type = 'time';
          input.value = evento.hora || '';
          input.style.fontSize = '1em';
          input.style.marginLeft = '8px';
          horaSpanEdit.replaceWith(input);
          input.focus();
          input.onblur = async () => {
            if (input.value && input.value !== evento.hora) {
              await fetch(`${API_BASE_URL}/eventos/${evento.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({hora: input.value})
              });
              location.reload();
            } else {
              input.replaceWith(horaSpanEdit);
            }
          };
        };
      }
    } else {
      document.getElementById('btnNotificarEvento').onclick = () => {
        // Simulação: salva interesse no localStorage
        let notificados = JSON.parse(localStorage.getItem('notificacoesEvento') || '{}');
        notificados[evento.id] = true;
        localStorage.setItem('notificacoesEvento', JSON.stringify(notificados));
        alert('Você será avisado quando a data do evento estiver próxima!');
      };
    }
  } catch (e) {
    document.body.innerHTML = '<p style="color:#c00;text-align:center;margin-top:40px">Erro ao carregar evento.</p>';
  }
});
