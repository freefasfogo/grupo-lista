// js/config.js
const config = {
    // URLs base
    get baseUrl() {
        return window.location.origin;
    },
    
    // Caminho base do projeto
    get basePath() {
        return '/grupo-lista/';
    },
    
    // URLs completas
    urls: {
        home: '/grupo-lista/index.html',
        cadastrar: '/grupo-lista/pages/cadastrar.html',
        vip: '/grupo-lista/pages/vip.html',
        admin: '/grupo-lista/pages/admin.html',
        login: '/grupo-lista/pages/login.html',
        grupo: '/grupo-lista/pages/grupo.html'
    },
    
    // Redirecionar para página
    redirectTo(page) {
        if (this.urls[page]) {
            window.location.href = this.urls[page];
        } else {
            window.location.href = this.urls.home;
        }
    },
    
    // Obter URL completa
    getUrl(page) {
        return this.baseUrl + this.urls[page];
    },
    
    // Verificar se está em pages/
    isInPages() {
        return window.location.pathname.includes('/pages/');
    },
    
    // Obter caminho relativo seguro
    getRelativePath(page) {
        if (this.isInPages()) {
            // Está em pages/
            const pagesPaths = {
                home: '../index.html',
                cadastrar: 'cadastrar.html',
                vip: 'vip.html',
                admin: 'admin.html',
                login: 'login.html',
                grupo: 'grupo.html'
            };
            return pagesPaths[page] || '../index.html';
        } else {
            // Está na raiz
            const rootPaths = {
                home: 'index.html',
                cadastrar: 'pages/cadastrar.html',
                vip: 'pages/vip.html',
                admin: 'pages/admin.html',
                login: 'pages/login.html',
                grupo: 'pages/grupo.html'
            };
            return rootPaths[page] || 'index.html';
        }
    }
};

window.config = config;
