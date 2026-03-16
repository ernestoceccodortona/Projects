let projects = JSON.parse(localStorage.getItem('linkcloud_projects')) || [];
let activeIdx = null;
let selectedService = null;

function addProject() {
    const name = prompt("Nome del progetto:");
    if (!name) return;
    projects.push({ name, links: [] });
    saveAndRender();
}

function deleteProject(idx) {
    if (confirm("Vuoi davvero eliminare l'intero progetto?")) {
        projects.splice(idx, 1);
        activeIdx = null;
        saveAndRender();
    }
}

async function dynamicSearch() {
    const query = document.getElementById('service-search').value;
    const resultsDiv = document.getElementById('search-results');
    if (query.length < 2) return;

    try {
        // API alternativa se Clearbit fallisce
        const resp = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`);
        const data = await resp.json();
        resultsDiv.innerHTML = '';
        data.forEach(c => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<img src="${c.logo}" width="16"> ${c.name}`;
            div.onclick = () => selectService(c);
            resultsDiv.appendChild(div);
        });
    } catch (e) {
        resultsDiv.innerHTML = '<small>Errore ricerca. Prova a digitare il dominio es. "google.com"</small>';
    }
}

function selectService(company) {
    selectedService = company;
    document.getElementById('selected-service-display').innerHTML = `<img src="${company.logo}" width="20"> Configurazione per ${company.name}`;
    document.getElementById('url-input-zone').style.display = 'block';
}

function confirmAddLink() {
    const url = document.getElementById('manual-url').value;
    if (!url) return alert("Incolla un link!");

    projects[activeIdx].links.push({
        title: selectedService.name + " File",
        url: url,
        logo: selectedService.logo
    });

    saveAndRender();
    document.getElementById('url-input-zone').style.display = 'none';
    document.getElementById('service-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function deleteLink(linkIdx, event) {
    event.preventDefault();
    event.stopPropagation();
    projects[activeIdx].links.splice(linkIdx, 1);
    saveAndRender();
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
        div.innerHTML = `<span>${p.name}</span>`;
        div.onclick = () => { activeIdx = i; render(); };
        list.appendChild(div);
    });

    const container = document.getElementById('links-container');
    const tool = document.getElementById('creator-tool');
    const delBtn = document.getElementById('del-project-btn');
    container.innerHTML = '';

    if (activeIdx !== null) {
        tool.style.display = 'block';
        delBtn.style.display = 'block';
        delBtn.onclick = () => deleteProject(activeIdx);
        document.getElementById('current-project-title').innerText = projects[activeIdx].name;

        projects[activeIdx].links.forEach((link, lIdx) => {
            const card = document.createElement('a');
            card.className = 'link-card';
            card.href = link.url;
            card.target = '_blank';
            card.innerHTML = `
                <button class="delete-link" onclick="deleteLink(${lIdx}, event)">X</button>
                <img src="${link.logo}">
                <span>${link.title}</span>
            `;
            container.appendChild(card);
        });
    }
}

render();
