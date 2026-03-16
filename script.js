let projects = JSON.parse(localStorage.getItem('linkcloud_projects')) || [];
let activeIdx = null;

const templates = [
    { name: 'Google Docs', url: 'https://docs.google.com/document/create', domain: 'docs.google.com' },
    { name: 'Figma', url: 'https://www.figma.com/file/new', domain: 'figma.com' },
    { name: 'Notion', url: 'https://www.notion.so/', domain: 'notion.so' },
    { name: 'Canva', url: 'https://www.canva.com/design/play', domain: 'canva.com' },
    { name: 'Trello', url: 'https://trello.com/create-board', domain: 'trello.com' },
    { name: 'Google Sheets', url: 'https://docs.google.com/spreadsheets/create', domain: 'sheets.google.com' }
];

function addProject() {
    const name = prompt("Nome del progetto (es. App Redesign):");
    if (!name) return;
    projects.push({ name, links: [] });
    saveAndRender();
}

function selectProject(index) {
    activeIdx = index;
    document.getElementById('creator-tool').style.display = 'block';
    render();
}

function searchService() {
    const query = document.getElementById('service-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    
    if (query.length < 1) return;

    const filtered = templates.filter(t => t.name.toLowerCase().includes(query));
    filtered.forEach(t => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<img src="https://logo.clearbit.com/${t.domain}?size=20" onerror="this.src='https://via.placeholder.com/20'"> <span>${t.name}</span>`;
        div.onclick = () => addLink(t.name, t.url, t.domain);
        resultsDiv.appendChild(div);
    });
}

function addLink(name, url, domain) {
    projects[activeIdx].links.push({ name, url, domain });
    saveAndRender();
    document.getElementById('service-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function saveAndRender() {
    localStorage.setItem('linkcloud_projects', JSON.stringify(projects));
    render();
}

function render() {
    // Sidebar progetti
    const list = document.getElementById('project-list');
    list.innerHTML = '';
    projects.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = `project-item ${activeIdx === i ? 'active' : ''}`;
        div.innerText = p.name;
        div.onclick = () => selectProject(i);
        list.appendChild(div);
    });

    // Griglia link
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    if (activeIdx !== null) {
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;
        projects[activeIdx].links.forEach(link => {
            const card = document.createElement('a');
            card.className = 'link-card';
            card.href = link.url;
            card.target = '_blank';
            card.innerHTML = `
                <img src="https://logo.clearbit.com/${link.domain}?size=100" onerror="this.src='https://via.placeholder.com/100'">
                <span>${link.name}</span>
            `;
            container.appendChild(card);
        });
    }
}

render();