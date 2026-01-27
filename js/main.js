// Funções utilitárias
const utils = {
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
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Sistema iniciando...');
    
    // Configurar logout manualmente
    const setupLogout = () => {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            // Remover event listeners antigos
            const newLogoutLink = logoutLink.cloneNode(true);
            logoutLink.parentNode.replaceChild(newLogoutLink, logoutLink);
            
            // Adicionar novo listener
            newLogoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Clicou em logout');
                
                const success = await auth.logout();
                if (success) {
                    utils.showToast('Logout realizado com sucesso!', 'success');
                    
                    // Atualizar UI
                    setTimeout(() => {
                        auth.updateAuthUI();
                    }, 100);
                    
                    // Redirecionar
                    setTimeout(() => {
                        const isInPages = window.location.pathname.includes('pages');
                        window.location.href = isInPages ? '../index.html' : 'index.html';
                    }, 1000);
                } else {
                    utils.showToast('Erro ao fazer logout', 'error');
                }
            });
        }
    };
    
    // Configurar formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;
            
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Entrando...';
            
            try {
                const result = await auth.login(email, password);
                if (result.success) {
                    utils.showToast('Login realizado com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                console.error('Erro no login:', error);
                utils.showToast('Erro ao fazer login', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
    
    // Configurar formulário de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = registerForm.querySelector('#register-email').value;
            const password = registerForm.querySelector('#register-password').value;
            const confirmPassword = registerForm.querySelector('#confirm-password').value;
            
            // Validações
            if (password !== confirmPassword) {
                utils.showToast('As senhas não coincidem', 'error');
                return;
            }
            
            if (password.length < 6) {
                utils.showToast('A senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
            
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Cadastrando...';
            
            try {
                const result = await auth.register(email, password);
                if (result.success) {
                    utils.showToast('Cadastro realizado! Verifique seu e-mail.', 'success');
                    registerForm.reset();
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 3000);
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                console.error('Erro no registro:', error);
                utils.showToast('Erro ao cadastrar', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
    
    // Aguardar Supabase estar pronto
    const waitForSupabase = () => {
        return new Promise((resolve) => {
            const check = () => {
                if (window.supabaseClient && window.auth) {
                    resolve(true);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    };
    
    // Inicializar sistema
    try {
        await waitForSupabase();
        
        console.log('✅ Supabase pronto');
        
        // Configurar logout
        setupLogout();
        
        // Atualizar UI inicial
        await auth.updateAuthUI();
        
        // Se estiver na página de login e já estiver logado, redirecionar
        if (window.location.pathname.includes('login.html')) {
            const isLoggedIn = await auth.isLoggedIn();
            if (isLoggedIn) {
                console.log('Já logado, redirecionando...');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 500);
            }
        }
        
        console.log('✅ Sistema inicializado com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});

// Exportar para uso global
window.utils = utils;
