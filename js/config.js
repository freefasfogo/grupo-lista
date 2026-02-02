// js/config.js - SIMPLIFICADO
const config = {
    // Redirecionar para página
    redirectTo(page) {
        const pages = {
            home: '/grupo-lista/index.html',
            cadastrar: '/grupo-lista/pages/cadastrar.html',
            vip: '/grupo-lista/pages/vip.html',
            admin: '/grupo-lista/pages/admin.html',
            login: '/grupo-lista/pages/login.html',
            grupo: '/grupo-lista/pages/grupo.html'
        };
        
        if (pages[page]) {
            window.location.href = pages[page];
        } else {
            window.location.href = pages.home;
        }
    },
    
    // Obter caminho relativo baseado na localização atual
    getRelativePath(page) {
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        
        if (isInPages) {
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
