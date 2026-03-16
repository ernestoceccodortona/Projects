let projects = JSON.parse(localStorage.getItem('linkcloud_v4')) || [];
let activeIdx = null;

const creationServices = [
    { name: 'Google Doc', createUrl: 'https://docs.google.com/document/create', domain: 'docs.google.com' },
    { name: 'Google Sheet', createUrl: 'https://docs.google.com/spreadsheets/create', domain: 'sheets.google.com' },
    { name: 'Figma Design', createUrl: 'https://www.figma.com/file/new', domain: 'figma.com' },
    { name: 'Notion Page', createUrl: 'https://www.notion.so/', domain: 'notion.so' },
    { name: 'Canva Design', createUrl: 'https://www.canva.com/design/play', domain: 'canva.com' }
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
    if (!title) return alert("Inserisci un nome per il file!");

    projects[activeIdx].links.push({
        title: title,
        url: service.createUrl,
        isNew: true, // Indica che il file deve ancora essere mappato
        domain: service.domain,
        logo: `https://logo.clearbit.com/${service.domain}`
    });

    save();
    document.getElementById('asset-name').value = '';
    document.getElementById('service-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

// LA LOGICA CHIAVE: Gestisce il click sulla card
function handleCardClick(linkIdx) {
    const link = projects[activeIdx].links[linkIdx];
    
    if (link.isNew) {
        // Primo click: Apriamo la creazione
        window.open(link.url, '_blank');
        
        // Chiediamo l'URL finale per "fissarlo"
        setTimeout(() => {
            const finalUrl = prompt(`Incolla qui l'URL del file "${link.title}" appena creato per fissarlo definitivamente:`);
            if (finalUrl) {
                link.url = finalUrl;
                link.isNew = false;
                save();
            }
        }, 1000);
    } else {
        // Click successivi: Vai direttamente al file
        window.open(link.url, '_blank');
    }
}

function deleteLink(lIdx, e) {
    e.stopPropagation(); // Evita di attivare il click della card
    projects[activeIdx].links.splice(lIdx, 1);
    save();
}

function save() {
    localStorage.setItem('linkcloud_v4', JSON.stringify(projects));
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
    const tool = document.getElementById('creator-tool');
    container.innerHTML = '';

    if (activeIdx !== null) {
        tool.style.display = 'block';
        document.getElementById('del-project-btn').style.display = 'block';
        document.getElementById('del-project-btn').onclick = () => {
            if(confirm("Elimina progetto?")) { projects.splice(activeIdx, 1); activeIdx = null; save(); }
        };
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;

        projects[activeIdx].links.forEach((l, i) => {
            const card = document.createElement('div');
            card.className = `link-card ${l.isNew ? 'is-new' : ''}`;
            card.onclick = () => handleCardClick(i);
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteLink(${i}, event)">✕</button>
                <img src="${l.logo}">
                <span>${l.title}</span>
                ${l.isNew ? '<small style="color:var(--accent)">Clicca per configurare</small>' : ''}
            `;
            container.appendChild(card);
        });
    }
}

render();
