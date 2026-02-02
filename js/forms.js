// js/forms.js
const forms = {
    // Carregar categorias no select
    async loadCategories(selectId = 'category') {
        try {
            const categorySelect = document.getElementById(selectId);
            if (!categorySelect) {
                console.log('Select de categoria não encontrado:', selectId);
                return;
            }
            
            console.log('Carregando categorias...');
            
            const categories = await db.getCategories();
            console.log('Categorias obtidas:', categories);
            
            if (categories.length === 0) {
                categorySelect.innerHTML = '<option value="">Nenhuma categoria disponível</option>';
                return;
            }
            
            let options = '<option value="">Selecione uma categoria</option>';
            categories.forEach(category => {
                options += `<option value="${category.id}">${category.name}</option>`;
            });
            
            categorySelect.innerHTML = options;
            console.log('Categorias carregadas no select');
            
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    },
    
    // Configurar formulário de cadastro de grupo
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
                window.location.href = 'pages/login.html';
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
                        window.location.href = '../index.html';
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
    
    // Configurar formulário de login
    initLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#login-email').value;
            const password = form.querySelector('#login-password').value;
            
            const btn = form.querySelector('button[type="submit"]');
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
    },
    
    // Configurar formulário de registro
    initRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.querySelector('#register-email').value;
            const password = form.querySelector('#register-password').value;
            const confirmPassword = form.querySelector('#confirm-password').value;
            
            // Validações
            if (password !== confirmPassword) {
                utils.showToast('As senhas não coincidem', 'error');
                return;
            }
            
            if (password.length < 6) {
                utils.showToast('A senha deve ter pelo menos 6 caracteres', 'error');
                return;
            }
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Cadastrando...';
            
            try {
                const result = await auth.register(email, password);
                if (result.success) {
                    utils.showToast('Cadastro realizado! Verifique seu e-mail.', 'success');
                    form.reset();
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
};

// Exportar para uso global
window.forms = forms;
