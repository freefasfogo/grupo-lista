// js/main.js
const utils = {
    // Formatar data
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    },
    
    // Mostrar toast
    showToast(message, type = 'success') {
        try {
            // Remover toasts antigos
            document.querySelectorAll('.toast').forEach(toast => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            });
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            // Forçar reflow
            toast.offsetHeight;
            
            // Mostrar
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Esconder
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('Erro ao mostrar toast:', error);
        }
    },
    
    // Obter parâmetro da URL
    getUrlParam(param) {
        try {
            return new URLSearchParams(window.location.search).get(param);
        } catch (error) {
            return null;
        }
    },
    
    // Debounce
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

// Renderizador de grupos
const groupsRenderer = {
    // Card de grupo
    renderGroupCard(group) {
        const platformClass = `platform-${group.platform.toLowerCase()}`;
        const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
        
        return `
            <div class="group-card ${group.isVIP ? 'vip' : ''}">
                ${vipBadge}
                <span class="platform-badge ${platformClass}">${group.platform}</span>
                <div class="group-card-image">
                    <img src="https://picsum.photos/seed/${group.id}/300/150.jpg" alt="${group.name}">
                </div>
                <div class="group-card-content">
                    <h3 class="group-card-title">${group.name}</h3>
                    <span class="group-card-category">${group.categories?.name || 'Sem categoria'}</span>
                    <p class="group-card-description">${group.description}</p>
                    <div class="group-card-footer">
                        <span class="group-card-views">${group.views || 0} visualizações</span>
                        <a href="${config.getRelativePath('grupo')}?id=${group.id}" class="btn btn-primary btn-sm">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Lista de grupos
    async renderGroupsList(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const groups = await db.getGroups(filters);
            
            if (groups.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhum grupo encontrado.</p>';
                return;
            }
            
            container.innerHTML = groups.map(group => this.renderGroupCard(group)).join('');
        } catch (error) {
            console.error('Erro ao renderizar grupos:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar grupos.</p>';
        }
    },
    
    // Detalhes do grupo
    async renderGroupDetails(groupId) {
        const container = document.getElementById('group-details');
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const group = await db.getGroupById(groupId);
            
            if (!group) {
                container.innerHTML = '<p class="text-center">Grupo não encontrado.</p>';
                return;
            }
            
            // Incrementar views
            await db.incrementViews(groupId);
            
            const platformClass = `platform-${group.platform.toLowerCase()}`;
            const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
            
            container.innerHTML = `
                <div class="group-details-container">
                    <div class="group-header">
                        <div class="group-image">
                            <img src="https://picsum.photos/seed/${group.id}/600/300.jpg" alt="${group.name}">
                            ${vipBadge}
                            <span class="platform-badge ${platformClass}">${group.platform}</span>
                        </div>
                        <div class="group-info">
                            <h1>${group.name}</h1>
                            <div class="group-meta">
                                <span class="group-category">${group.categories?.name || 'Sem categoria'}</span>
                                <span class="group-date">${this.formatDate(group.created_at)}</span>
                                <span class="group-views">${(group.views || 0) + 1} visualizações</span>
                            </div>
                        </div>
                    </div>
                    <div class="group-description">
                        <h2>Descrição</h2>
                        <p>${group.description}</p>
                    </div>
                    <div class="group-action">
                        <a href="${group.invite_link}" target="_blank" class="btn btn-primary">Entrar no Grupo</a>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erro ao renderizar detalhes:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar detalhes.</p>';
        }
    },
    
    // Formatar data
    formatDate(dateString) {
        return utils.formatDate(dateString);
    },
    
    // Carregar categorias no filtro
    async loadCategoriesFilter() {
        const filter = document.getElementById('category-filter');
        if (!filter) return;
        
        try {
            const categories = await db.getCategories();
            
            let options = '<option value="">Todas as categorias</option>';
            categories.forEach(category => {
                options += `<option value="${category.id}">${category.name}</option>`;
            });
            
            filter.innerHTML = options;
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando sistema...');
    
    // Aguardar módulos
    await new Promise(resolve => {
        const check = () => {
            if (window.db && window.auth && window.config) {
                console.log('✅ Módulos carregados');
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
    
    // Atualizar UI de auth
    await auth.updateAuthUI();
    
    // Configurar logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const success = await auth.logout();
            if (success) {
                utils.showToast('Logout realizado!', 'success');
                setTimeout(() => config.redirectTo('home'), 1000);
            }
        });
    }
    
    // Página inicial
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        console.log('📄 Página inicial detectada');
        
        // Carregar categorias
        await groupsRenderer.loadCategoriesFilter();
        
        // Carregar grupos
        await groupsRenderer.renderGroupsList('groups-container');
        
        // Configurar busca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(async () => {
                const search = searchInput.value;
                const category = document.getElementById('category-filter')?.value || '';
                const platform = document.getElementById('platform-filter')?.value || '';
                
                await groupsRenderer.renderGroupsList('groups-container', {
                    search, category, platform
                });
            }, 500));
        }
        
        // Configurar filtros
        document.getElementById('category-filter')?.addEventListener('change', async () => {
            const search = searchInput?.value || '';
            const category = document.getElementById('category-filter')?.value || '';
            const platform = document.getElementById('platform-filter')?.value || '';
            
            await groupsRenderer.renderGroupsList('groups-container', {
                search, category, platform
            });
        });
        
        document.getElementById('platform-filter')?.addEventListener('change', async () => {
            const search = searchInput?.value || '';
            const category = document.getElementById('category-filter')?.value || '';
            const platform = document.getElementById('platform-filter')?.value || '';
            
            await groupsRenderer.renderGroupsList('groups-container', {
                search, category, platform
            });
        });
    }
    
    // Página de detalhes
    if (window.location.pathname.includes('grupo.html')) {
        const groupId = utils.getUrlParam('id');
        if (groupId) {
            await groupsRenderer.renderGroupDetails(groupId);
        }
    }
    
    console.log('✅ Sistema inicializado');
});

// Exportar
window.utils = utils;
window.groupsRenderer = groupsRenderer;
