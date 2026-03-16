let projects = JSON.parse(localStorage.getItem('linkcloud_final')) || [];
let activeIdx = null;

// Database dei "Magic Links" per la creazione istantanea
const creationServices = [
    { name: 'Google Doc', createUrl: 'https://docs.google.com/document/create', domain: 'docs.google.com' },
    { name: 'Google Sheet', createUrl: 'https://docs.google.com/spreadsheets/create', domain: 'sheets.google.com' },
    { name: 'Figma Design', createUrl: 'https://www.figma.com/file/new', domain: 'figma.com' },
    { name: 'Notion Page', createUrl: 'https://www.notion.so/', domain: 'notion.so' },
    { name: 'Canva Design', createUrl: 'https://www.canva.com/design/play', domain: 'canva.com' },
    { name: 'Miro Board', createUrl: 'https://miro.com/app/dashboard/', domain: 'miro.com' },
    { name: 'Trello Board', createUrl: 'https://trello.com/create-board', domain: 'trello.com' },
    { name: 'GitHub Repo', createUrl: 'https://github.com/new', domain: 'github.com' }
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

    const filtered = creationServices.filter(s => s.name.toLowerCase().includes(query));
    
    filtered.forEach(s => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<img src="https://logo.clearbit.com/${s.domain}?size=16"> ${s.name}`;
        div.onclick = () => instantiateLink(s);
        resultsDiv.appendChild(div);
    });
}

function instantiateLink(service) {
    const title = document.getElementById('asset-name').value;
    if (!title) return alert("Prima inserisci un nome per il file!");

    // Creiamo l'elemento senza aprire nulla
    projects[activeIdx].links.push({
        title: title,
        url: service.createUrl,
        logo: `https://logo.clearbit.com/${service.domain}`
    });

    save();
    
    // Reset campi
    document.getElementById('asset-name').value = '';
    document.getElementById('service-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function deleteLink(lIdx, e) {
    e.preventDefault();
    projects[activeIdx].links.splice(lIdx, 1);
    save();
}

function save() {
    localStorage.setItem('linkcloud_final', JSON.stringify(projects));
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
            const card = document.createElement('a');
            card.className = 'link-card';
            card.href = l.url;
            card.target = '_blank';
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteLink(${i}, event)">✕</button>
                <img src="${l.logo}">
                <span>${l.title}</span>
            `;
            container.appendChild(card);
        });
    }
}

render();
