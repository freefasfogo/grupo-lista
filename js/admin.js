// Adicione estas funções ao objeto admin no arquivo js/admin.js:

const admin = {
    // ... funções existentes ...
    
    // Renderizar categorias
    async renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const categories = await db.getCategories();
            
            console.log('Categorias carregadas:', categories); // Debug
            
            if (categories.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhuma categoria encontrada.</p>';
                return;
            }
            
            container.innerHTML = categories.map(category => `
                <div class="category-item" data-id="${category.id}">
                    <span>${category.name}</span>
                    <div class="category-actions">
                        <button class="btn-action btn-edit-category" data-id="${category.id}">Editar</button>
                        <button class="btn-action btn-delete-category" data-id="${category.id}">Excluir</button>
                    </div>
                </div>
            `).join('');
            
            this.attachCategoryListeners();
            
        } catch (error) {
            console.error('Erro ao renderizar categorias:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar categorias.</p>';
        }
    },
    
    // Anexar listeners para categorias
    attachCategoryListeners() {
        // Botões de editar categoria
        document.querySelectorAll('.btn-edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.id;
                const categoryItem = btn.closest('.category-item');
                const categoryName = categoryItem.querySelector('span').textContent;
                
                categoryItem.innerHTML = `
                    <input type="text" class="form-control edit-category-input" value="${categoryName}">
                    <div class="category-actions">
                        <button class="btn-action btn-save-category" data-id="${categoryId}">Salvar</button>
                        <button class="btn-action btn-cancel-edit">Cancelar</button>
                    </div>
                `;
                
                // Adicionar listeners para salvar/cancelar
                const saveBtn = categoryItem.querySelector('.btn-save-category');
                const cancelBtn = categoryItem.querySelector('.btn-cancel-edit');
                const input = categoryItem.querySelector('.edit-category-input');
                
                if (saveBtn) {
                    saveBtn.addEventListener('click', async () => {
                        await this.updateCategory(categoryId, input.value);
                    });
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        this.renderCategories();
                    });
                }
            });
        });
        
        // Botões de deletar categoria
        document.querySelectorAll('.btn-delete-category').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir esta categoria?')) {
                    const success = await this.deleteCategory(btn.dataset.id);
                    if (success) {
                        utils.showToast('Categoria excluída!', 'success');
                        await this.renderCategories();
                    } else {
                        utils.showToast('Erro ao excluir categoria.', 'error');
                    }
                }
            });
        });
    },
    
    // Atualizar categoria
    async updateCategory(id, name) {
        try {
            if (!name.trim()) {
                utils.showToast('O nome da categoria não pode estar vazio.', 'error');
                return false;
            }
            
            const { error } = await supabaseClient
                .from('categories')
                .update({ name: name.trim() })
                .eq('id', id);
            
            if (error) throw error;
            
            utils.showToast('Categoria atualizada!', 'success');
            await this.renderCategories();
            return true;
            
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            utils.showToast('Erro ao atualizar categoria.', 'error');
            return false;
        }
    },
    
    // Deletar categoria
    async deleteCategory(id) {
        try {
            // Verificar se há grupos usando esta categoria
            const { data: groups, error: groupsError } = await supabaseClient
                .from('groups')
                .select('id')
                .eq('category', id)
                .limit(1);
            
            if (groupsError) throw groupsError;
            
            if (groups && groups.length > 0) {
                utils.showToast('Não é possível excluir: existem grupos usando esta categoria.', 'error');
                return false;
            }
            
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return true;
            
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            utils.showToast('Erro ao excluir categoria.', 'error');
            return false;
        }
    },
    
    // Verificar se é admin
    async requireAdmin() {
        try {
            const isAdmin = await db.isAdmin();
            
            if (!isAdmin) {
                utils.showToast('Acesso negado. Apenas administradores podem acessar.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
        }
    }
};

// Atualize a inicialização do admin.js:
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Painel admin iniciando...');
    
    // Verificar se é admin
    const isAdmin = await admin.requireAdmin();
    if (!isAdmin) return;
    
    console.log('✅ Usuário é admin, carregando painel...');
    
    // Inicializar seções
    await admin.renderPendingGroups();
    await admin.renderAllGroups();
    await admin.renderCategories(); // Adicionar esta linha
    
    // Configurar navegação
    const navLinks = document.querySelectorAll('.admin-sidebar a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover classe active de todos
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');
            
            // Adicionar classe active ao clicado
            link.classList.add('active');
            
            // Mostrar seção correspondente
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
    });
    
    // Configurar formulário de categoria
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('category-name');
            const name = nameInput.value.trim();
            
            if (!name) {
                utils.showToast('Digite um nome para a categoria.', 'error');
                return;
            }
            
            const submitBtn = categoryForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Adicionando...';
            
            try {
                const result = await db.createCategory({ name });
                
                if (result) {
                    utils.showToast('Categoria adicionada com sucesso!', 'success');
                    nameInput.value = '';
                    await admin.renderCategories();
                } else {
                    utils.showToast('Erro ao adicionar categoria.', 'error');
                }
            } catch (error) {
                console.error('Erro ao adicionar categoria:', error);
                utils.showToast('Erro: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
