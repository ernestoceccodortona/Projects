let projects = JSON.parse(localStorage.getItem('linkcloud_v3')) || [];
let activeIdx = null;
let selectedService = null;

// Database interno di emergenza se l'API fallisce o viene bloccata
const internalServices = [
    { name: 'Google Docs', domain: 'docs.google.com', logo: 'https://logo.clearbit.com/docs.google.com' },
    { name: 'Figma', domain: 'figma.com', logo: 'https://logo.clearbit.com/figma.com' },
    { name: 'Notion', domain: 'notion.so', logo: 'https://logo.clearbit.com/notion.so' },
    { name: 'GitHub', domain: 'github.com', logo: 'https://logo.clearbit.com/github.com' },
    { name: 'Canva', domain: 'canva.com', logo: 'https://logo.clearbit.com/canva.com' },
    { name: 'Slack', domain: 'slack.com', logo: 'https://logo.clearbit.com/slack.com' }
];

function addProject() {
    const name = prompt("Nome Progetto:");
    if (name) { projects.push({ name, links: [] }); save(); }
}

async function dynamicSearch() {
    const query = document.getElementById('service-search').value.toLowerCase();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    if (query.length < 1) return;

    // 1. Mostra sempre i risultati interni per velocità e affidabilità
    const filtered = internalServices.filter(s => s.name.toLowerCase().includes(query));
    
    // 2. Tenta fetch esterno (potrebbe fallire per CORS)
    try {
        const resp = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`);
        const data = await resp.json();
        data.forEach(c => {
            if(!filtered.find(f => f.domain === c.domain)) filtered.push(c);
        });
    } catch (e) { console.warn("API esterna bloccata, uso database interno."); }

    filtered.forEach(s => {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.innerHTML = `<img src="${s.logo}" width="16"> ${s.name}`;
        div.onclick = () => {
            selectedService = s;
            document.getElementById('url-input-zone').style.display = 'block';
            document.getElementById('selected-service-info').innerHTML = `Stai aggiungendo un file di <strong>${s.name}</strong>`;
        };
        resultsDiv.appendChild(div);
    });
}

function confirmAddLink() {
    const title = document.getElementById('link-title').value;
    const url = document.getElementById('manual-url').value;
    if (!title || !url) return alert("Inserisci titolo e URL!");

    projects[activeIdx].links.push({ title, url, logo: selectedService.logo });
    save();
    
    // Reset
    document.getElementById('link-title').value = '';
    document.getElementById('manual-url').value = '';
    document.getElementById('url-input-zone').style.display = 'none';
    document.getElementById('service-search').value = '';
}

function deleteLink(lIdx, e) {
    e.preventDefault();
    projects[activeIdx].links.splice(lIdx, 1);
    save();
}

function deleteProject() {
    if(confirm("Eliminare il progetto?")) {
        projects.splice(activeIdx, 1);
        activeIdx = null;
        save();
    }
}

function save() {
    localStorage.setItem('linkcloud_v3', JSON.stringify(projects));
    render();
}

function render() {
    const pList = document.getElementById('project-list');
    pList.innerHTML = '';
    projects.forEach((p, i) => {
        const btn = document.createElement('div');
        btn.className = `project-item ${activeIdx === i ? 'active' : ''}`;
        btn.innerHTML = `<span>${p.name}</span>`;
        btn.onclick = () => { activeIdx = i; render(); };
        pList.appendChild(btn);
    });

    const container = document.getElementById('links-container');
    const tool = document.getElementById('creator-tool');
    const delBtn = document.getElementById('del-project-btn');
    container.innerHTML = '';

    if (activeIdx !== null) {
        tool.style.display = 'block';
        delBtn.style.display = 'block';
        delBtn.onclick = deleteProject;
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;

        projects[activeIdx].links.forEach((l, i) => {
            const card = document.createElement('a');
            card.className = 'link-card';
            card.href = l.url;
            card.target = '_blank';
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteLink(${i}, event)">Elimina</button>
                <img src="${l.logo}">
                <span>${l.title}</span>
            `;
            container.appendChild(card);
        });
    }
}

render();
