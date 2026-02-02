// js/forms.js
const forms = {
    // Carregar categorias
    async loadCategories(selectId = 'category') {
        try {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const categories = await db.getCategories();
            
            let options = '<option value="">Selecione uma categoria</option>';
            categories.forEach(cat => {
                options += `<option value="${cat.id}">${cat.name}</option>`;
            });
            
            select.innerHTML = options;
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    },
    
    // Inicializar formulário de grupo
    async initGroupForm() {
        const form = document.getElementById('group-form');
        if (!form) return;
        
        console.log('📝 Inicializando formulário de grupo');
        
        // Carregar categorias
        await this.loadCategories();
        
        // Configurar submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            console.log('📤 Enviando formulário...');
            
            // Verificar login
            const isLoggedIn = await auth.isLoggedIn();
            if (!isLoggedIn) {
                utils.showToast('Faça login para cadastrar um grupo', 'error');
                config.redirectTo('login');
                return;
            }
            
            // Obter dados
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
            
            // Validação
            if (!groupData.name || !groupData.platform || !groupData.category || 
                !groupData.description || !groupData.invite_link) {
                utils.showToast('Preencha todos os campos', 'error');
                return;
            }
            
            // Botão
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Enviando...';
            
            try {
                const result = await db.createGroup(groupData);
                
                if (result) {
                    utils.showToast('Grupo cadastrado com sucesso!', 'success');
                    form.reset();
                    
                    setTimeout(() => {
                        config.redirectTo('home');
                    }, 2000);
                } else {
                    utils.showToast('Erro ao cadastrar grupo', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                utils.showToast('Erro: ' + error.message, 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    },
    
    // Inicializar formulário de login
    initLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#login-email').value;
            const password = form.querySelector('#login-password').value;
            
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Entrando...';
            
            try {
                const result = await auth.login(email, password);
                
                if (result.success) {
                    utils.showToast('Login realizado!', 'success');
                    setTimeout(() => config.redirectTo('home'), 1000);
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                utils.showToast('Erro inesperado', 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    },
    
    // Inicializar formulário de registro
    initRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#register-email').value;
            const password = form.querySelector('#register-password').value;
            const confirmPassword = form.querySelector('#confirm-password').value;
            
            // Validação
            if (password !== confirmPassword) {
                utils.showToast('Senhas não coincidem', 'error');
                return;
            }
            
            if (password.length < 6) {
                utils.showToast('Senha precisa ter 6+ caracteres', 'error');
                return;
            }
            
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Cadastrando...';
            
            try {
                const result = await auth.register(email, password);
                
                if (result.success) {
                    utils.showToast('Cadastro realizado! Verifique seu email.', 'success');
                    form.reset();
                    setTimeout(() => config.redirectTo('home'), 3000);
                } else {
                    utils.showToast(result.error, 'error');
                }
            } catch (error) {
                utils.showToast('Erro inesperado', 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
};

window.forms = forms;
