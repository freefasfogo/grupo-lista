// Funções utilitárias
const utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Forçar reflow para animação funcionar
        toast.offsetHeight;
        
        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Esconder e remover após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    },
    
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

// Funções para renderização de grupos
const groupsRenderer = {
    renderGroupCard(group) {
        const platformClass = `platform-${group.platform}`;
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
            
            await db.incrementViews(groupId);
            
            const platformClass = `platform-${group.platform}`;
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
                        <a href="${group.invite_link}" target="_blank" class="btn btn-${group.platform.toLowerCase()}">Entrar no Grupo</a>
                    </div>
                </div>
            `;
            
            document.title = `${group.name} - Grupos de ${group.platform}`;
            
        } catch (error) {
            console.error('Erro ao renderizar detalhes do grupo:', error);
            container.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar os detalhes do grupo. Tente novamente mais tarde.</p>';
        }
    }
};

// Funções para formulários
const forms = {
    async initGroupForm() {
        const form = document.getElementById('group-form');
        if (!form) return;
        
        const categories = await db.getCategories();
        const categorySelect = document.getElementById('category');
        
        if (categorySelect && categories.length > 0) {
            categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const isLoggedIn = await auth.isLoggedIn();
            if (!isLoggedIn) {
                utils.showToast('Você precisa estar logado para cadastrar um grupo.', 'error');
                return;
            }
            
            const formData = new FormData(form);
            const groupData = {
                name: formData.get('name'),
                platform: formData.get('platform'),
                category: formData.get('category'),
                description: formData.get('description'),
                invite_link: formData.get('invite_link'),
                status: 'pending',
                isVIP: false,
                views: 0,
                created_at: new Date().toISOString()
            };
            
            if (!groupData.name || !groupData.platform || !groupData.category || !groupData.description || !groupData.invite_link) {
                utils.showToast('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            try {
                const result = await db.createGroup(groupData);
                
                if (result) {
                    utils.showToast('Grupo cadastrado com sucesso! Aguarde a aprovação.', 'success');
                    form.reset();
                } else {
                    utils.showToast('Ocorreu um erro ao cadastrar o grupo. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro ao cadastrar grupo:', error);
                utils.showToast('Ocorreu um erro ao cadastrar o grupo. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    },
    
    initLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';
            
            try {
                const result = await auth.login(email, password);
                
                if (result.success) {
                    utils.showToast('Login realizado com sucesso!', 'success');
                    const redirectUrl = utils.getUrlParam('redirect') || '/';
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                utils.showToast('Ocorreu um erro ao fazer login. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    },
    
    initRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            
            if (password !== confirmPassword) {
                utils.showToast('As senhas não coincidem.', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cadastrando...';
            
            try {
                const result = await auth.register(email, password);
                
                if (result.success) {
                    utils.showToast('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.', 'success');
                    form.reset();
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao registrar:', error);
                utils.showToast('Ocorreu um erro ao registrar. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    await auth.updateAuthUI();
    
    forms.initGroupForm();
    forms.initLoginForm();
    forms.initRegisterForm();
    
    // Página inicial
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        await groupsRenderer.renderGroupsList('groups-container');
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(async () => {
                const search = searchInput.value.trim();
                const category = document.getElementById('category-filter')?.value || '';
                const platform = document.getElementById('platform-filter')?.value || '';
                
                await groupsRenderer.renderGroupsList('groups-container', { search, category, platform });
            }, 500));
        }
        
        const categoryFilter = document.getElementById('category-filter');
        const platformFilter = document.getElementById('platform-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', async () => {
                const search = searchInput?.value.trim() || '';
                const category = categoryFilter.value;
                const platform = platformFilter?.value || '';
                await groupsRenderer.renderGroupsList('groups-container', { search, category, platform });
            });
        }
        
        if (platformFilter) {
            platformFilter.addEventListener('change', async () => {
                const search = searchInput?.value.trim() || '';
                const category = categoryFilter?.value || '';
                const platform = platformFilter.value;
                await groupsRenderer.renderGroupsList('groups-container', { search, category, platform });
            });
        }
        
        const categories = await db.getCategories();
        if (categoryFilter && categories.length > 0) {
            categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    }
    
    // Página de detalhes do grupo
    if (window.location.pathname.endsWith('grupo.html')) {
        const groupId = utils.getUrlParam('id');
        if (groupId) {
            await groupsRenderer.renderGroupDetails(groupId);
        } else {
            document.getElementById('group-details').innerHTML = '<p class="text-center">Grupo não especificado.</p>';
        }
    }
    
    // Configurar logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const success = await auth.logout();
            if (success) {
                utils.showToast('Logout realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                utils.showToast('Ocorreu um erro ao fazer logout. Tente novamente.', 'error');
            }
        });
    }
});

// Exportar para uso em outros arquivos
window.utils = utils;
window.groupsRenderer = groupsRenderer;
window.forms = forms;
