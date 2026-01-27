// Funções utilitárias
const utils = {
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateString;
        }
    },
    
    showToast(message, type = 'success') {
        try {
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
    
    getUrlParam(param) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        } catch (error) {
            console.error('Erro ao obter parâmetro URL:', error);
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

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, inicializando...');
    
    try {
        // Verificar se supabase está disponível
        if (typeof supabase === 'undefined') {
            console.error('SUPABASE NÃO CARREGADO!');
            utils.showToast('Erro ao carregar o sistema. Recarregue a página.', 'error');
            return;
        }
        
        console.log('Supabase carregado:', !!supabase);
        
        // Atualizar UI de autenticação
        await auth.updateAuthUI();
        
        // Inicializar formulários - SOMENTE se as funções existirem
        if (typeof forms !== 'undefined' && forms.initLoginForm) {
            forms.initLoginForm();
            forms.initRegisterForm();
            forms.initGroupForm();
        } else {
            console.error('Funções forms não disponíveis');
        }
        
        // Resto do código permanece igual...
        // ... (mantenha o resto do seu código main.js aqui)
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        utils.showToast('Erro ao carregar a página. Recarregue.', 'error');
    }
});

// Exportar para uso global
window.utils = utils;
