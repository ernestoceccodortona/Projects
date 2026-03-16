let projects = JSON.parse(localStorage.getItem('linkcloud_auto')) || [];
let activeIdx = null;

const creationServices = [
    { name: 'Google Doc', createUrl: 'https://docs.google.com/document/create', domain: 'docs.google.com' },
    { name: 'Google Sheet', createUrl: 'https://docs.google.com/spreadsheets/create', domain: 'sheets.google.com' },
    { name: 'Figma Design', createUrl: 'https://www.figma.com/file/new', domain: 'figma.com' }
];

function addProject() {
    const name = prompt("Nome Progetto:");
    if (name) { projects.push({ name, links: [] }); save(); }
}

function dynamicSearch() {
    const query = document.getElementById('service-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    if (query.length < 1) return;

    creationServices.filter(s => s.name.toLowerCase().includes(query)).forEach(s => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<img src="https://logo.clearbit.com/${s.domain}?size=16"> ${s.name}`;
        div.onclick = () => instantiateLink(s);
        resultsDiv.appendChild(div);
    });
}

function instantiateLink(service) {
    const title = document.getElementById('asset-name').value;
    if (!title) return alert("Inserisci un nome!");

    projects[activeIdx].links.push({
        title: title,
        url: service.createUrl,
        isNew: true,
        logo: `https://logo.clearbit.com/${service.domain}`
    });

    save();
    document.getElementById('asset-name').value = '';
    document.getElementById('service-search').value = '';
}

// IL MOTORE AUTOMATICO
function handleAutoLink(linkIdx) {
    const link = projects[activeIdx].links[linkIdx];
    
    // Se è già stato catturato, apri normalmente
    if (!link.isNew) {
        window.open(link.url, '_blank');
        return;
    }

    // Se è nuovo, apriamo il popup di creazione
    const popup = window.open(link.url, 'LinkCloudPopup', 'width=1000,height=800');
    
    // Avviamo un timer che controlla ogni secondo l'indirizzo del popup
    const monitor = setInterval(() => {
        try {
            const currentUrl = popup.location.href;
            
            // Se l'URL non è più quello di "creazione", significa che il file è nato!
            if (currentUrl && currentUrl !== link.url && currentUrl !== 'about:blank') {
                link.url = currentUrl;
                link.isNew = false;
                save();
                clearInterval(monitor);
                console.log("URL catturato automaticamente:", currentUrl);
            }
        } catch (e) {
            // Se scatta un errore di sicurezza (CORS), l'utente ha finito la creazione
            // e il browser ci impedisce di leggere l'URL. 
            // In questo caso, avvisiamo l'utente di chiudere il popup per confermare.
        }

        if (popup.closed) {
            clearInterval(monitor);
        }
    }, 1000);
}

function save() {
    localStorage.setItem('linkcloud_auto', JSON.stringify(projects));
    render();
}

function render() {
    const pList = document.getElementById('project-list');
    pList.innerHTML = '';
    projects.forEach((p, i) => {
        const btn = document.createElement('div');
        btn.className = `project-item ${activeIdx === i ? 'active' : ''}`;
        btn.innerText = p.name;
        btn.onclick = () => { activeIdx = i; render(); };
        pList.appendChild(btn);
    });

    const container = document.getElementById('links-container');
    container.innerHTML = '';

    if (activeIdx !== null) {
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;
        document.getElementById('creator-tool').style.display = 'block';

        projects[activeIdx].links.forEach((l, i) => {
            const card = document.createElement('div');
            card.className = `link-card ${l.isNew ? 'syncing' : 'ready'}`;
            card.onclick = () => handleAutoLink(i);
            card.innerHTML = `
                <img src="${l.logo}">
                <span>${l.title}</span>
                <small>${l.isNew ? 'Click per generare' : 'File pronto'}</small>
            `;
            container.appendChild(card);
        });
    }
}
render();
