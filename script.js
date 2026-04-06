const itemsData = {
    bottle: {
        name: 'Пластиковая бутылка',
        harm: '😢 Разлагается 450 лет! Пластик попадает в океан, рыбы принимают его за еду и погибают. Микрочастицы пластика уже есть в воде, которую мы пьём.',
        tip: '✅ Используй многоразовую бутылку. Сдавай пластик в специальные контейнеры (маркировка 1 (PET) и 2 (HDPE)).',
        icon: '💧'
    },
    battery: {
        name: 'Батарейка',
        harm: '☠️ Одна батарейка отравляет 20 м² земли или 400 литров воды! Содержит ртуть, свинец, кадмий — они попадают в почву и растения.',
        tip: '✅ Сдавай в пункты приёма (IKEA, ВкусВилл, магазины электроники). Переходи на аккумуляторы — их можно заряжать 500+ раз!',
        icon: '🔋'
    },
    cup: {
        name: 'Одноразовый стаканчик',
        harm: '🥤 Внутри покрыт пластиком (полиэтиленом), поэтому его НЕ перерабатывают! 500 млрд стаканов в год — горы мусора на 500 лет.',
        tip: '✅ Носи с собой термокружку. Многие кофейни дают скидку 10-20% за свой стакан! Бумажные стаканы — только если нет альтернативы.',
        icon: '🧋'
    },
    can: {
        name: 'Аэрозольный баллончик',
        harm: '💨 Содержит пропелленты (газы), которые разрушают озоновый слой. Также может взорваться на свалке от жары. Внутри часто остаются токсичные остатки.',
        tip: '✅ Полностью опорожни и сдай в пункт приёма опасных отходов. Вместо лака для волос используй твёрдые средства (стики/пудра).',
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

async function initAR() {
    // Показываем сообщение о запуске
    showTemporaryMessage('🎥 Запуск камеры... Разрешите доступ когда появится запрос', 3000);
    
    const mindAR = new MindAR.Image({
        container: document.getElementById('ar-container'),
        imageTargetSrc: 'target.mind',
        maxTrack: 1,
        autoStart: true
    });

    await mindAR.start();
    
    // Показываем инструкцию
    showTemporaryMessage('🔍 Наведи камеру на эко-предметы (бутылка, батарейка, стаканчик, баллончик)', 5000);
    
    mindAR.addEventListener('targetFound', (event) => {
        const targetName = event.detail.name;
        
        if (!collected[targetName] && !currentMessageShowing) {
            collected[targetName] = true;
            totalCollected++;
            
            // Воспроизводим звук (если разрешено)
            playCollectSound();
            
            // Обновляем значки
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
            
            // Обновляем прогресс
            document.getElementById('progress-text').innerHTML = `Найди 4 предмета: ${totalCollected}/4`;
            
            // Показываем информацию
            showInfoCard(targetName);
            
            // Проверяем победу
            if (totalCollected === 4) {
                setTimeout(() => {
                    if (document.getElementById('congrats').style.display !== 'flex') {
                        document.getElementById('congrats').style.display = 'flex';
                        playVictorySound();
                    }
                }, 1000);
            }
        }
    });
    
    mindAR.addEventListener('targetLost', (event) => {
        console.log('Маркер потерян:', event.detail.name);
    });
}

function showInfoCard(itemKey) {
    currentMessageShowing = true;
    const data = itemsData[itemKey];
    
    const title = document.getElementById('message-title');
    const textDiv = document.getElementById('message-text');
    const tipDiv = document.getElementById('message-tip');
    
    title.innerHTML = `${data.icon} ${data.name}`;
    textDiv.innerHTML = `<strong>🌿 Вред природе:</strong><br>${data.harm}`;
    tipDiv.innerHTML = `<strong>💚 Как помочь:</strong><br>${data.tip}`;
    
    const panel = document.getElementById('message-panel');
    panel.style.display = 'block';
    
    // Автоскрытие через 8 секунд
    setTimeout(() => {
        if (currentMessageShowing) {
            closeMessage();
        }
    }, 8000);
}

function closeMessage() {
    const panel = document.getElementById('message-panel');
    if (panel) {
        panel.style.display = 'none';
    }
    currentMessageShowing = false;
}

function showTemporaryMessage(text, duration) {
    // Создаём временное уведомление
    const msgDiv = document.createElement('div');
    msgDiv.textContent = text;
    msgDiv.style.position = 'fixed';
    msgDiv.style.bottom = '100px';
    msgDiv.style.left = '20px';
    msgDiv.style.right = '20px';
    msgDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
    msgDiv.style.color = '#4CAF50';
    msgDiv.style.padding = '12px';
    msgDiv.style.borderRadius = '40px';
    msgDiv.style.textAlign = 'center';
    msgDiv.style.fontSize = '14px';
    msgDiv.style.zIndex = '15';
    msgDiv.style.backdropFilter = 'blur(10px)';
    msgDiv.style.border = '1px solid #4CAF50';
    msgDiv.style.fontWeight = 'bold';
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.remove();
    }, duration);
}

function playCollectSound() {
    try {
        // Простой звук через Web Audio API (без внешних файлов)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.2;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Возобновляем AudioContext после взаимодействия пользователя
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch(e) {
        console.log('Звук не поддерживается');
    }
}

function playVictorySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Первая нота
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 523.25;
        gain1.gain.value = 0.2;
        osc1.start();
        gain1.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
        osc1.stop(audioContext.currentTime + 0.3);
        
        // Вторая нота (через 0.3 сек)
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25;
            gain2.gain.value = 0.2;
            osc2.start();
            gain2.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 300);
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch(e) {
        console.log('Звук не поддерживается');
    }
}

// Проверка поддержки браузера
function checkBrowserSupport() {
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if (!isHTTPS && !isLocalhost) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.right = '0';
        errorDiv.style.bottom = '0';
        errorDiv.style.backgroundColor = 'rgba(0,0,0,0.95)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '30px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.display = 'flex';
        errorDiv.style.flexDirection = 'column';
        errorDiv.style.justifyContent = 'center';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.textAlign = 'center';
        errorDiv.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
            <h2 style="color: #ff6b6b;">Ошибка безопасности</h2>
            <p style="margin: 20px 0;">Для работы камеры сайт должен открываться через <strong style="color: #4CAF50;">HTTPS</strong></p>
            <p style="font-size: 14px; color: #aaa;">Сейчас используется: ${location.protocol}</p>
            <p style="margin-top: 30px; font-size: 14px;">Пожалуйста, добавьте "s" в http:// → https://</p>
            <button onclick="location.reload()" style="margin-top: 30px; padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 40px; font-size: 16px;">🔄 Перезагрузить</button>
        `;
        document.body.appendChild(errorDiv);
        return false;
    }
    
    // Проверка поддержки камеры
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.bottom = '20px';
        errorDiv.style.left = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.backgroundColor = 'rgba(255,0,0,0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '15px';
        errorDiv.style.borderRadius = '16px';
        errorDiv.style.zIndex = '9998';
        errorDiv.style.fontSize = '14px';
        errorDiv.innerHTML = '⚠️ Ваш браузер не поддерживает доступ к камере. Используйте Chrome, Safari или Firefox.';
        document.body.appendChild(errorDiv);
        return false;
    }
    
    return true;
}

// Запуск при загрузке страницы
window.onload = () => {
    console.log('Страница загружена, проверяем поддержку...');
    
    // Проверяем поддержку браузера и HTTPS
    if (!checkBrowserSupport()) {
        return;
    }
    
    // Небольшая задержка для отрисовки UI
    setTimeout(() => {
        initAR().catch(err => {
            console.error('Ошибка при инициализации AR:', err);
            
            let errorMessage = '';
            let errorDetails = '';
            
            if (err.name === 'NotAllowedError') {
                errorMessage = '❌ Нет доступа к камере';
                errorDetails = 'Вы не разрешили доступ к камере. Нажмите на значок замка 🔒 в адресной строке и разрешите использование камеры, затем перезагрузите страницу.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = '❌ Камера не найдена';
                errorDetails = 'На вашем устройстве не обнаружена камера. Пожалуйста, используйте устройство с камерой.';
            } else if (err.name === 'NotSupportedError') {
                errorMessage = '❌ Браузер не поддерживается';
                errorDetails = 'Ваш браузер не поддерживает WebAR. Пожалуйста, используйте Google Chrome (Android) или Safari (iPhone).';
            } else if (err.message && err.message.includes('target.mind')) {
                errorMessage = '❌ Файл маркеров не найден';
                errorDetails = 'Файл target.mind отсутствует. Проверьте, что он загружен в репозиторий.';
            } else {
                errorMessage = '❌ Ошибка запуска AR';
                errorDetails = `Подробнее: ${err.message || err}\n\nПопробуйте перезагрузить страницу или использовать другой браузер.`;
            }
            
            // Показываем красивое сообщение об ошибке
            const errorPanel = document.createElement('div');
            errorPanel.style.position = 'fixed';
            errorPanel.style.bottom = '20px';
            errorPanel.style.left = '20px';
            errorPanel.style.right = '20px';
            errorPanel.style.backgroundColor = 'rgba(0,0,0,0.95)';
            errorPanel.style.backdropFilter = 'blur(15px)';
            errorPanel.style.borderRadius = '24px';
            errorPanel.style.padding = '20px';
            errorPanel.style.zIndex = '9997';
            errorPanel.style.borderLeft = '4px solid #ff6b6b';
            errorPanel.style.fontSize = '14px';
            errorPanel.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 10px;">${errorMessage === '❌ Ошибка запуска AR' ? '📷' : '⚠️'}</div>
                <h3 style="color: #ff6b6b; margin-bottom: 12px;">${errorMessage}</h3>
                <p style="color: #ccc; line-height: 1.5; margin-bottom: 16px;">${errorDetails}</p>
                <button onclick="location.reload()" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 40px; font-size: 16px; font-weight: bold;">🔄 Перезагрузить</button>
            `;
            document.body.appendChild(errorPanel);
        });
    }, 500);
};

// Делаем функции глобальными для вызова из HTML
window.closeMessage = closeMessage;
window.playCollectSound = playCollectSound;
