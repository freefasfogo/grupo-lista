// js/config.js
const config = {
    // URLs base
    baseUrl: window.location.origin,
    
    // Caminhos relativos
    paths: {
        // A partir da raiz
        root: {
            home: 'index.html',
            cadastrar: 'pages/cadastrar.html',
            vip: 'pages/vip.html',
            admin: 'pages/admin.html',
            login: 'pages/login.html',
            grupo: 'pages/grupo.html'
        },
        // A partir de pages/
        pages: {
            home: '../index.html',
            cadastrar: 'cadastrar.html',
            vip: 'vip.html',
            admin: 'admin.html',
            login: 'login.html',
            grupo: 'grupo.html'
        }
    },
    
    // Obter caminho correto baseado na localização atual
    getPath(page) {
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('pages');
        
        if (isInPages) {
            return this.paths.pages[page] || this.paths.pages.home;
        } else {
            return this.paths.root[page] || this.paths.root.home;
        }
    },
    
    // Redirecionar para página
    redirectTo(page) {
        window.location.href = this.getPath(page);
    },
    
    // Obter URL completa
    getFullUrl(page) {
        return `${this.baseUrl}/${this.getPath(page)}`.replace(/\/\//g, '/');
    }
};

window.config = config;
