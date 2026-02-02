// No início do forms.js, adicione:
if (!window.config) {
    console.warn('Config não carregado, carregando...');
    // Carregar config dinamicamente se necessário
    const script = document.createElement('script');
    script.src = 'js/config.js';
    document.head.appendChild(script);
}

// Depois atualize a função initGroupForm:
async initGroupForm() {
    const form = document.getElementById('group-form');
    if (!form) {
        console.log('Formulário de grupo não encontrado');
        return;
    }
    
    console.log('Inicializando formulário de grupo...');
    
    // Carregar categorias
    await this.loadCategories();
    
    // Configurar submit do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('Enviando formulário...');
        
        // Verificar se está logado
        const isLoggedIn = await auth.isLoggedIn();
        if (!isLoggedIn) {
            utils.showToast('Você precisa estar logado para cadastrar um grupo.', 'error');
            
            // Usar config para redirecionamento correto
            if (window.config) {
                window.config.redirectTo('login');
            } else {
                // Fallback
                const currentPath = window.location.pathname;
                if (currentPath.includes('pages')) {
                    window.location.href = 'login.html';
                } else {
                    window.location.href = 'pages/login.html';
                }
            }
            return;
        }
        
        // Obter dados do formulário
        const formData = new FormData(form);
        const groupData = {
            name: formData.get('name'),
            platform: formData.get('platform'),
            category: formData.get('category'),
            description: formData.get('description'),
            invite_link: formData.get('invite_link'),
            status: 'pending',
            isVIP: false,
            views: 0
        };
        
        console.log('Dados do grupo:', groupData);
        
        // Validações
        if (!groupData.name || !groupData.platform || !groupData.category || 
            !groupData.description || !groupData.invite_link) {
            utils.showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (!groupData.invite_link.includes('http')) {
            utils.showToast('Por favor, insira um link válido (começando com http:// ou https://).', 'error');
            return;
        }
        
        // Enviar
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            const result = await db.createGroup(groupData);
            
            if (result) {
                utils.showToast('Grupo cadastrado com sucesso! Aguarde a aprovação.', 'success');
                form.reset();
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    if (window.config) {
                        window.config.redirectTo('home');
                    } else {
                        // Fallback
                        const currentPath = window.location.pathname;
                        if (currentPath.includes('pages')) {
                            window.location.href = '../index.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                }, 2000);
            } else {
                utils.showToast('Erro ao cadastrar grupo. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao cadastrar grupo:', error);
            utils.showToast('Erro ao cadastrar grupo.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
    
    console.log('Formulário de grupo inicializado');
},
