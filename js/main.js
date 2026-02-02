// js/main.js - Atualize o início do arquivo

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
    },
    
    // Verificar se módulos estão carregados
    async waitForModules(modules = ['db', 'auth', 'supabaseClient']) {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 30; // 3 segundos
            
            const check = () => {
                attempts++;
                
                const allLoaded = modules.every(module => {
                    if (module === 'supabaseClient') {
                        return window.supabaseClient && window.supabaseClient.auth;
                    }
                    return window[module];
                });
                
                if (allLoaded || attempts >= maxAttempts) {
                    if (allLoaded) {
                        console.log('✅ Todos os módulos carregados');
                    } else {
                        console.warn('⚠️ Alguns módulos não carregados após timeout');
                    }
                    resolve(allLoaded);
                } else {
                    console.log(`⏳ Aguardando módulos... (${attempts}/${maxAttempts})`);
                    setTimeout(check, 100);
                }
            };
            
            check();
        });
    }
};

// ... (resto do main.js permanece igual, mas atualize a inicialização) ...

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Sistema iniciando...');
    
    // Aguardar módulos essenciais
    const modulesLoaded = await utils.waitForModules(['db', 'auth']);
    
    if (!modulesLoaded) {
        utils.showToast('Erro ao carregar o sistema. Por favor, recarregue a página.', 'error');
        return;
    }
    
    // Resto do código permanece igual...
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
    
    // ... resto do código ...
});

// Exportar para uso global
window.utils = utils;
window.groupsRenderer = groupsRenderer;
