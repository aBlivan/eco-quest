const itemsData = {
    bottle: {
        name: 'Пластиковая бутылка',
        harm: '😢 Разлагается 450 лет! Пластик попадает в океан, рыбы принимают его за еду и погибают.',
        tip: '✅ Используй многоразовую бутылку. Сдавай пластик в спецконтейнеры.',
        icon: '💧'
    },
    battery: {
        name: 'Батарейка',
        harm: '☠️ Одна батарейка отравляет 20 м² земли! Содержит ртуть и свинец.',
        tip: '✅ Сдавай в пункты приёма (IKEA, ВкусВилл). Переходи на аккумуляторы!',
        icon: '🔋'
    },
    cup: {
        name: 'Одноразовый стаканчик',
        harm: '🥤 Внутри покрыт пластиком, поэтому НЕ перерабатывается!',
        tip: '✅ Носи с собой термокружку. В кофейнях дают скидку за свой стакан!',
        icon: '🧋'
    },
    can: {
        name: 'Аэрозольный баллончик',
        harm: '💨 Разрушает озоновый слой и может взорваться на свалке.',
        tip: '✅ Полностью опорожни и сдай в пункт приёма опасных отходов.',
        icon: '🧴'
    }
};

let collected = {
    bottle: false,
    battery: false,
    cup: false,
    can: false
};

let totalCollected = 0;
let currentMessageShowing = false;
let mindARInstance = null;

function showTemporaryMessage(text, duration, isError = false) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = text;
    msgDiv.style.position = 'fixed';
    msgDiv.style.bottom = '100px';
    msgDiv.style.left = '20px';
    msgDiv.style.right = '20px';
    msgDiv.style.backgroundColor = isError ? 'rgba(255,0,0,0.9)' : 'rgba(0,0,0,0.85)';
    msgDiv.style.color = 'white';
    msgDiv.style.padding = '12px';
    msgDiv.style.borderRadius = '40px';
    msgDiv.style.textAlign = 'center';
    msgDiv.style.fontSize = '14px';
    msgDiv.style.zIndex = '15';
    msgDiv.style.backdropFilter = 'blur(10px)';
    msgDiv.style.border = isError ? '1px solid red' : '1px solid #4CAF50';
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        if (msgDiv && msgDiv.remove) msgDiv.remove();
    }, duration);
}

async function startAR() {
    // Скрываем стартовый экран, показываем AR
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ui-overlay').style.display = 'block';
    document.getElementById('ar-container').style.display = 'block';
    
    showTemporaryMessage('🎥 Запуск камеры... Разрешите доступ', 3000);
    
    try {
        // Сначала запрашиваем разрешение на камеру вручную
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Останавливаем поток (MindAR сам запросит снова, но разрешение уже дано)
        stream.getTracks().forEach(track => track.stop());
        
        showTemporaryMessage('✅ Доступ к камере получен! Ищу маркеры...', 2000);
        
        // Запускаем MindAR
        mindARInstance = new MindAR.Image({
            container: document.getElementById('ar-container'),
            imageTargetSrc: 'target.mind',
            maxTrack: 1,
            autoStart: true
        });

        await mindARInstance.start();
        
        showTemporaryMessage('🔍 Наведи камеру на эко-предметы (бутылка, батарейка, стаканчик, баллончик)', 5000);
        
        mindARInstance.addEventListener('targetFound', (event) => {
            const targetName = event.detail.name;
            
            if (!collected[targetName] && !currentMessageShowing) {
                collected[targetName] = true;
                totalCollected++;
                
                const badgeMap = {
                    bottle: 'badge-bottle',
                    battery: 'badge-battery',
                    cup: 'badge-cup',
                    can: 'badge-can'
                };
                const badgeElement = document.getElementById(badgeMap[targetName]);
                if (badgeElement) {
                    badgeElement.classList.add('collected');
                    badgeElement.innerHTML = '✅';
                }
                
                document.getElementById('progress-text').innerHTML = `Найди 4 предмета: ${totalCollected}/4`;
                showInfoCard(targetName);
                
                if (totalCollected === 4) {
                    setTimeout(() => {
                        document.getElementById('congrats').style.display = 'flex';
                    }, 1000);
                }
            }
        });
        
    } catch (err) {
        console.error('Ошибка доступа к камере:', err);
        
        let errorMsg = '';
        if (err.name === 'NotAllowedError') {
            errorMsg = '❌ Вы не разрешили доступ к камере. Нажмите на значок замка 🔒 в адресной строке и разрешите камеру, затем обновите страницу.';
        } else if (err.name === 'NotFoundError') {
            errorMsg = '❌ Камера не найдена на вашем устройстве.';
        } else {
            errorMsg = `❌ Ошибка: ${err.message || err.name}`;
        }
        
        showTemporaryMessage(errorMsg, 8000, true);
        
        // Показываем кнопку повтора
        const retryBtn = document.createElement('button');
        retryBtn.textContent = '🔄 Попробовать снова';
        retryBtn.style.position = 'fixed';
        retryBtn.style.bottom = '50px';
        retryBtn.style.left = '50%';
        retryBtn.style.transform = 'translateX(-50%)';
        retryBtn.style.padding = '12px 24px';
        retryBtn.style.backgroundColor = '#4CAF50';
        retryBtn.style.color = 'white';
        retryBtn.style.border = 'none';
        retryBtn.style.borderRadius = '40px';
        retryBtn.style.zIndex = '100';
        retryBtn.style.fontSize = '16px';
        retryBtn.style.cursor = 'pointer';
        retryBtn.onclick = () => {
            retryBtn.remove();
            startAR();
        };
        document.body.appendChild(retryBtn);
    }
}

function showInfoCard(itemKey) {
    currentMessageShowing = true;
    const data = itemsData[itemKey];
    
    document.getElementById('message-title').innerHTML = `${data.icon} ${data.name}`;
    document.getElementById('message-text').innerHTML = `<strong>🌿 Вред природе:</strong><br>${data.harm}`;
    document.getElementById('message-tip').innerHTML = `<strong>💚 Как помочь:</strong><br>${data.tip}`;
    document.getElementById('message-panel').style.display = 'block';
    
    setTimeout(() => {
        if (currentMessageShowing) closeMessage();
    }, 8000);
}

function closeMessage() {
    document.getElementById('message-panel').style.display = 'none';
    currentMessageShowing = false;
}

// Запуск по кнопке
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-camera-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startAR);
    }
});

window.closeMessage = closeMessage;
