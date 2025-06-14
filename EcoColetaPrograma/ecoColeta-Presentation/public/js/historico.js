// filepath: historico-recompensas/src/js/historico.js
document.addEventListener('DOMContentLoaded', function() {
    const rewardsList = document.getElementById('rewards-list');
    const rewards = [
        { date: '2024-03-20', amount: 50, status: 'completed' },
        { date: '2025-05-15', amount: 75, status: 'completed' },
        { date: '2025-06-10', amount: 100, status: 'pending' }
    ];

    function renderRewards() {
        rewardsList.innerHTML = '';
        rewards.forEach(reward => {
            const listItem = document.createElement('li');
            listItem.className = 'reward-item';
            listItem.innerHTML = `
                <span class="reward-date">${reward.date}</span>
                <span class="reward-amount">R$ ${reward.amount}</span>
                <span class="reward-status">${reward.status}</span>
            `;
            rewardsList.appendChild(listItem);
        });
    }

    renderRewards();
});