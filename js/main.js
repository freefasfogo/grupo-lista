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
            
            // Forçar reflow para animação
            toast.offsetHeight;
            
            // Mostrar toast
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Esconder e remover após 3 segundos
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
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        } catch (error) {
            console.error('Erro ao obter parâmetro URL:', error);
            return null;
        }
    },
    
    // Debounce para pesquisa
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

// Renderizador de grupos
const groupsRenderer = {
    // Renderizar card de grupo
    renderGroupCard(group) {
        const platformClass = `platform-${group.platform.toLowerCase()}`;
        const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
        
        return `
            <div class="group-card ${group.isVIP ? 'vip' : ''}">
                ${vipBadge}
                <span class="platform-badge ${platformClass}">${group.platform}</span>
                <div class="group-card-image">
                    <img src="https://picsum.photos/seed/${group.id}/300/150.jpg" alt="${group.name}" loading="lazy">
                </div>
                <div class="group-card-content">
                    <h3 class="group-card-title">${group.name}</h3>
                    <span class="group-card-category">${group.categories?.name || 'Sem categoria'}</span>
                    <p class="group-card-description">${group.description}</p>
                    <div class="group-card-footer">
                        <span class="group-card-views">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                            </svg>
                            ${group.views || 0} visualizações
                        </span>
                        <a href="pages/grupo.html?id=${group.id}" class="btn btn-primary btn-sm">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Renderizar lista de grupos
    async renderGroupsList(containerId, filters = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const groups = await db.getGroups(filters);
            
            if (groups.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhum grupo encontrado. <a href="pages/cadastrar.html">Seja o primeiro a cadastrar!</a></p>';
                return;
            }
            
            container.innerHTML = groups.map(group => this.renderGroupCard(group)).join('');
        } catch (error) {
            console.error('Erro ao renderizar grupos:', error);
            container.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar os grupos. Tente novamente mais tarde.</p>';
        }
    },
    
    // Renderizar detalhes do grupo
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
            
            // Incrementar visualizações
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
                                <span class="group-category">Categoria: ${group.categories?.name || 'Sem categoria'}</span>
                                <span class="group-date">Criado em: ${utils.formatDate(group.created_at)}</span>
                                <span class="group-views">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                    </svg>
                                    ${(group.views || 0) + 1} visualizações
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="group-description">
                        <h2>Descrição</h2>
                        <p>${group.description}</p>
                    </div>
                    <div class="group-action">
                        <a href="${group.invite_link}" target="_blank" class="btn btn-primary btn-lg">Entrar no Grupo</a>
                    </div>
                </div>
            `;
            
            document.title = `${group.name} - Grupos de ${group.platform}`;
            
        } catch (error) {
            console.error('Erro ao renderizar detalhes do grupo:', error);
            container.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar os detalhes do grupo. Tente novamente mais tarde.</p>';
        }
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
            console.error('Erro ao carregar categorias no filtro:', error);
        }
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Sistema iniciando...');
    
    // Aguardar Supabase estar pronto
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            const check = () => {
                if (window.supabaseClient && window.db && window.auth) {
                    console.log('✅ Todos os módulos carregados');
                    resolve(true);
                } else {
                    console.log('Aguardando módulos...');
                    setTimeout(check, 100);
                }
            };
            check();
        });
    };
    
    try {
        await waitForSupabase();
        
        // Atualizar UI de autenticação
        await auth.updateAuthUI();
        
        // Configurar logout
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const success = await auth.logout();
                if (success) {
                    utils.showToast('Logout realizado com sucesso!', 'success');
                    
                    // Atualizar UI
                    setTimeout(() => {
                        auth.updateAuthUI();
                    }, 100);
                    
                    // Redirecionar
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    utils.showToast('Erro ao fazer logout', 'error');
                }
            });
        }
        
        // Página inicial
        if (window.location.pathname.includes('index.html') || 
            window.location.pathname.endsWith('/') || 
            window.location.pathname === '/grupo-lista/' ||
            window.location.pathname === '/') {
            
            console.log('Carregando página inicial...');
            
            // Carregar categorias no filtro
            await groupsRenderer.loadCategoriesFilter();
            
            // Carregar grupos inicialmente
            await groupsRenderer.renderGroupsList('groups-container');
            
            // Configurar busca
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', utils.debounce(async () => {
                    const search = searchInput.value.trim();
                    const category = document.getElementById('category-filter')?.value || '';
                    const platform = document.getElementById('platform-filter')?.value || '';
                    
                    await groupsRenderer.renderGroupsList('groups-container', { 
                        search, 
                        category, 
                        platform 
                    });
                }, 500));
            }
            
            // Configurar filtros
            const categoryFilter = document.getElementById('category-filter');
            const platformFilter = document.getElementById('platform-filter');
            
            if (categoryFilter) {
                categoryFilter.addEventListener('change', async () => {
                    const search = searchInput?.value.trim() || '';
                    const category = categoryFilter.value;
                    const platform = platformFilter?.value || '';
                    
                    await groupsRenderer.renderGroupsList('groups-container', { 
                        search, 
                        category, 
                        platform 
                    });
                });
            }
            
            if (platformFilter) {
                platformFilter.addEventListener('change', async () => {
                    const search = searchInput?.value.trim() || '';
                    const category = categoryFilter?.value || '';
                    const platform = platformFilter.value;
                    
                    await groupsRenderer.renderGroupsList('groups-container', { 
                        search, 
                        category, 
                        platform 
                    });
                });
            }
        }
        
        // Página de detalhes do grupo
        if (window.location.pathname.includes('grupo.html')) {
            console.log('Carregando página de detalhes...');
            
            const groupId = utils.getUrlParam('id');
            if (groupId) {
                await groupsRenderer.renderGroupDetails(groupId);
            } else {
                document.getElementById('group-details').innerHTML = '<p class="text-center">Grupo não especificado.</p>';
            }
        }
        
        console.log('✅ Sistema inicializado com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        utils.showToast('Erro ao inicializar o sistema', 'error');
    }
});

// Exportar para uso global
window.utils = utils;
window.groupsRenderer = groupsRenderer;
