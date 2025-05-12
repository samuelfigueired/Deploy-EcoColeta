document.querySelectorAll('.card-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (btn.classList.contains('doar')) {
      alert('Obrigado por doar seus pontos para projetos ambientais!');
    } else {
      alert('Recompensa resgatada com sucesso!');
    }
  });
});
