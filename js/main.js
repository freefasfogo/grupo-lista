// Funções utilitárias
const utils = {
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    },
    
    showToast(message, type = 'success') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            toast.offsetHeight;
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
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
    
    getUrlParam(param) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        } catch (error) {
            return null;
        }
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
        try {
            const platformClass = `platform-${group.platform}`;
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
        } catch (error) {
            return '<div class="group-card"><p>Erro ao carregar grupo</p></div>';
        }
    },
    
    async renderGroupsList(containerId, filters = {}) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '<div class="spinner"></div>';
            
            const groups = await db.getGroups(filters);
            
            if (!groups || groups.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhum grupo encontrado. <a href="pages/cadastrar.html">Seja o primeiro a cadastrar!</a></p>';
                return;
            }
            
            container.innerHTML = groups.map(group => this.renderGroupCard(group)).join('');
        } catch (error) {
            console.error('Erro ao renderizar grupos:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p class="text-center">Erro ao carregar grupos.</p>';
            }
        }
    }
};

// Funções para formulários
const forms = {
    initLoginForm() {
        try {
            const form = document.getElementById('login-form');
            if (!form) return;
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const email = formData.get('email');
                const password = formData.get('password');
                
                if (!email || !password) {
                    utils.showToast('Preencha todos os campos.', 'error');
                    return;
                }
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Entrando...';
                
                try {
                    const result = await auth.login(email, password);
                    
                    if (result.success) {
                        utils.showToast('Login realizado com sucesso!', 'success');
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 1000);
                    } else {
                        utils.showToast(result.error || 'Erro ao fazer login', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao fazer login:', error);
                    utils.showToast('Erro ao fazer login.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar login:', error);
        }
    },
    
    initRegisterForm() {
        try {
            const form = document.getElementById('register-form');
            if (!form) return;
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const email = formData.get('email');
                const password = formData.get('password');
                const confirmPassword = formData.get('confirm_password');
                
                if (!email || !password || !confirmPassword) {
                    utils.showToast('Preencha todos os campos.', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    utils.showToast('As senhas não coincidem.', 'error');
                    return;
                }
                
                if (password.length < 6) {
                    utils.showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
                    return;
                }
                
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Cadastrando...';
                
                try {
                    const result = await auth.register(email, password);
                    
                    if (result.success) {
                        utils.showToast('Cadastro realizado! Verifique seu e-mail.', 'success');
                        form.reset();
                        
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 3000);
                    } else {
                        utils.showToast(result.error || 'Erro ao cadastrar', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao registrar:', error);
                    utils.showToast('Erro ao cadastrar.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar registro:', error);
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado...');
    
    try {
        // Verificar se supabase está disponível
        if (typeof supabase === 'undefined') {
            console.error('Supabase não carregado!');
            return;
        }
        
        console.log('Supabase carregado:', !!supabase);
        console.log('Supabase auth:', !!supabase.auth);
        
        // Inicializar formulários
        forms.initLoginForm();
        forms.initRegisterForm();
        
        // Página inicial - carregar grupos
        if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
            console.log('Carregando grupos...');
            await groupsRenderer.renderGroupsList('groups-container');
        }
        
        console.log('Inicialização completa');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});

// Exportar para uso global
window.utils = utils;
window.groupsRenderer = groupsRenderer;
window.forms = forms;
