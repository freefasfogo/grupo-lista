// js/forms.js - CORRIGIDO
const forms = {
    // Carregar categorias
    async loadCategories(selectId = 'category') {
        try {
            console.log('Carregando categorias...');
            const select = document.getElementById(selectId);
            if (!select) {
                console.log('Select não encontrado:', selectId);
                return;
            }
            
            // Verificar se db está disponível
            if (!window.db) {
                console.error('DB não disponível');
                select.innerHTML = '<option value="">Erro ao carregar</option>';
                return;
            }
            
            const categories = await db.getCategories();
            console.log('Categorias obtidas:', categories);
            
            if (!categories || categories.length === 0) {
                select.innerHTML = '<option value="">Nenhuma categoria</option>';
                return;
            }
            
            let options = '<option value="">Selecione uma categoria</option>';
            categories.forEach(cat => {
                options += `<option value="${cat.id}">${cat.name}</option>`;
            });
            
            select.innerHTML = options;
            console.log('Categorias carregadas no select');
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        }
    },
    
    // Inicializar formulário de grupo
    async initGroupForm() {
        const form = document.getElementById('group-form');
        if (!form) {
            console.log('Formulário de grupo não encontrado');
            return;
        }
        
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
                if (window.config) {
                    window.config.redirectTo('login');
                } else {
                    window.location.href = 'login.html';
                }
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
            
            console.log('Dados do grupo:', groupData);
            
            // Validação
            if (!groupData.name || !groupData.platform || !groupData.category || 
                !groupData.description || !groupData.invite_link) {
                utils.showToast('Preencha todos os campos', 'error');
                return;
            }
            
            if (!groupData.invite_link.startsWith('http')) {
                utils.showToast('Insira um link válido (http:// ou https://)', 'error');
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
                    utils.showToast('Grupo cadastrado com sucesso! Aguarde aprovação.', 'success');
                    form.reset();
                    
                    setTimeout(() => {
                        if (window.config) {
                            window.config.redirectTo('home');
                        } else {
                            window.location.href = '../index.html';
                        }
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
            
            if (!email || !password) {
                utils.showToast('Preencha email e senha', 'error');
                return;
            }
            
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Entrando...';
            
            try {
                const result = await auth.login(email, password);
                
                if (result.success) {
                    utils.showToast('Login realizado com sucesso!', 'success');
                    setTimeout(() => {
                        if (window.config) {
                            window.config.redirectTo('home');
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1000);
                } else {
                    utils.showToast(result.error || 'Erro no login', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
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
            if (!email || !password || !confirmPassword) {
                utils.showToast('Preencha todos os campos', 'error');
                return;
            }
            
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
                    setTimeout(() => {
                        if (window.config) {
                            window.config.redirectTo('home');
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 3000);
                } else {
                    utils.showToast(result.error || 'Erro no cadastro', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                utils.showToast('Erro inesperado', 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
};

window.forms = forms;
