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

async function initAR() {
    const mindAR = new MindAR.Image({
        container: document.getElementById('ar-container'),
        imageTargetSrc: 'target.mind',
        maxTrack: 1,
        autoStart: true
    });

    await mindAR.start();
    
    mindAR.addEventListener('targetFound', (event) => {
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
}

function showInfoCard(itemKey) {
    currentMessageShowing = true;
    const data = itemsData[itemKey];
    
    document.getElementById('message-title').innerHTML = `${data.icon} ${data.name}`;
    document.getElementById('message-text').innerHTML = `<strong>🌿 Вред природе:</strong><br>${data.harm}`;
    document.getElementById('message-tip').innerHTML = `<strong>💚 Как помочь:</strong><br>${data.tip}`;
    document.getElementById('message-panel').style.display = 'block';
    
    setTimeout(() => {
        if (currentMessageShowing) {
            closeMessage();
        }
    }, 10000);
}

function closeMessage() {
    document.getElementById('message-panel').style.display = 'none';
    currentMessageShowing = false;
}

window.onload = () => {
    initAR().catch(err => {
        console.error('Ошибка:', err);
        alert('Не удалось запустить камеру. Проверь разрешения и HTTPS.');
    });
};

window.closeMessage = closeMessage;