// Funções utilitárias
const utils = {
    showToast(message, type = 'success') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            toast.offsetHeight;
            
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) document.body.removeChild(toast);
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('Erro ao mostrar toast:', error);
        }
    }
};

// Funções para formulários
const forms = {
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
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } else {
                    utils.showToast(result.error || 'Erro ao fazer login', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                utils.showToast('Erro ao fazer login', 'error');
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
                utils.showToast('As senhas não coincidem', 'error');
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
                console.error('Erro:', error);
                utils.showToast('Erro ao cadastrar', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado...');
    
    // Inicializar formulários
    forms.initLoginForm();
    forms.initRegisterForm();
    
    // Atualizar UI de auth
    if (auth.updateAuthUI) {
        auth.updateAuthUI();
    }
    
    console.log('Inicialização completa');
});

// Exportar
window.utils = utils;
window.forms = forms;
