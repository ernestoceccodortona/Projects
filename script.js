let projects = JSON.parse(localStorage.getItem('linkcloud_dialog_v1')) || [];
let activeIdx = null;
let pendingLinkIdx = null;

const services = [
    { name: 'Google Doc', createUrl: 'https://docs.google.com/document/create', domain: 'docs.google.com' },
    { name: 'Google Sheet', createUrl: 'https://docs.google.com/spreadsheets/create', domain: 'sheets.google.com' },
    { name: 'Figma', createUrl: 'https://www.figma.com/file/new', domain: 'figma.com' },
    { name: 'Notion', createUrl: 'https://www.notion.so/', domain: 'notion.so' }
];

function addProject() {
    const name = prompt("Nome Progetto:");
    if (name) { projects.push({ name, links: [] }); save(); }
}

function dynamicSearch() {
    const q = document.getElementById('service-search').value.toLowerCase();
    const res = document.getElementById('search-results');
    res.innerHTML = '';
    if (!q) return;
    services.filter(s => s.name.toLowerCase().includes(q)).forEach(s => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<img src="https://logo.clearbit.com/${s.domain}?size=16"> ${s.name}`;
        div.onclick = () => instantiate(s);
        res.appendChild(div);
    });
}

function instantiate(service) {
    const title = document.getElementById('asset-name').value || 'Senza nome';
    projects[activeIdx].links.push({
        title, url: service.createUrl, isNew: true, logo: `https://logo.clearbit.com/${service.domain}`
    });
    save();
    document.getElementById('asset-name').value = '';
    document.getElementById('service-search').value = '';
}

// GESTIONE DEL CLICK E DEL DIALOG
function handleCardClick(idx) {
    const link = projects[activeIdx].links[idx];
    if (!link.isNew) {
        window.open(link.url, '_blank');
    } else {
        pendingLinkIdx = idx;
        // 1. Apri il servizio per creare il file
        window.open(link.url, '_blank');
        // 2. Mostra il dialog per incollare l'URL
        const dialog = document.getElementById('url-dialog');
        document.getElementById('dialog-url-input').value = '';
        dialog.showModal();
    }
}

document.getElementById('confirm-url-btn').onclick = () => {
    const newUrl = document.getElementById('dialog-url-input').value;
    if (newUrl.startsWith('http')) {
        projects[activeIdx].links[pendingLinkIdx].url = newUrl;
        projects[activeIdx].links[pendingLinkIdx].isNew = false;
        save();
        document.getElementById('url-dialog').close();
    } else {
        alert("Inserisci un link valido!");
    }
};

function save() {
    localStorage.setItem('linkcloud_dialog_v1', JSON.stringify(projects));
    render();
}

function render() {
    const pList = document.getElementById('project-list');
    pList.innerHTML = '';
    projects.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = `project-item ${activeIdx === i ? 'active' : ''}`;
        div.innerText = p.name;
        div.onclick = () => { activeIdx = i; render(); };
        pList.appendChild(div);
    });

    const container = document.getElementById('links-container');
    container.innerHTML = '';
    if (activeIdx !== null) {
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;
        document.getElementById('creator-tool').style.display = 'block';
        document.getElementById('del-project-btn').style.display = 'block';
        document.getElementById('del-project-btn').onclick = () => {
            if(confirm("Elimina progetto?")) { projects.splice(activeIdx, 1); activeIdx = null; save(); }
        };

        projects[activeIdx].links.forEach((l, i) => {
            const card = document.createElement('div');
            card.className = 'link-card';
            card.onclick = () => handleCardClick(i);
            card.innerHTML = `
                <img src="${l.logo}">
                <span>${l.title}</span>
                ${l.isNew ? '<span class="pending-badge">DA FISSARE</span>' : ''}
            `;
            container.appendChild(card);
        });
    }
}
render();
