let projects = JSON.parse(localStorage.getItem('linkcloud_projects')) || [];
let activeIdx = null;
let selectedService = null;

// Gestione Progetti
function addProject() {
    const name = prompt("Nome del progetto:");
    if (!name) return;
    projects.push({ name, links: [] });
    saveAndRender();
}

function selectProject(index) {
    activeIdx = index;
    document.getElementById('creator-tool').style.display = 'block';
    render();
}

// Ricerca Dinamica Universale
async function dynamicSearch() {
    const query = document.getElementById('service-search').value;
    const resultsDiv = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`);
        const data = await response.json();
        
        resultsDiv.innerHTML = '';
        data.forEach(company => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<img src="${company.logo}" width="20" height="20"> <span>${company.name}</span>`;
            div.onclick = () => prepareLink(company);
            resultsDiv.appendChild(div);
        });
    } catch (e) {
        console.error("Errore nella ricerca servizi:", e);
    }
}

function prepareLink(company) {
    selectedService = company;
    document.getElementById('url-input-zone').style.display = 'block';
    
    // Lista di shortcuts per la creazione rapida
    const createShortcuts = {
        'google.com': 'https://docs.google.com/document/create',
        'figma.com': 'https://www.figma.com/file/new',
        'notion.so': 'https://www.notion.so/',
        'canva.com': 'https://www.canva.com/design/play'
    };
    
    const urlToOpen = createShortcuts[company.domain] || `https://${company.domain}`;
    window.open(urlToOpen, '_blank');
}

function confirmAddLink() {
    const url = document.getElementById('manual-url').value;
    if (!url || !selectedService) {
        alert("Per favore, inserisci un link valido.");
        return;
    }

    projects[activeIdx].links.push({
        name: selectedService.name,
        url: url,
        logo: selectedService.logo
    });

    saveAndRender();
    
    // Reset UI
    document.getElementById('manual-url').value = '';
    document.getElementById('url-input-zone').style.display = 'none';
    document.getElementById('service-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function saveAndRender() {
    localStorage.setItem('linkcloud_projects', JSON.stringify(projects));
    render();
}

function render() {
    const list = document.getElementById('project-list');
    list.innerHTML = '';
    projects.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = `project-item ${activeIdx === i ? 'active' : ''}`;
        div.innerText = p.name;
        div.onclick = () => selectProject(i);
        list.appendChild(div);
    });

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
                <img src="${link.logo}" onerror="this.src='https://via.placeholder.com/100'">
                <span>${link.name}</span>
            `;
            container.appendChild(card);
        });
    }
}

// Caricamento iniziale
render();
