// Funções administrativas
const admin = {
    // Renderizar tabela de grupos pendentes
    async renderPendingGroups() {
        const container = document.getElementById('pending-groups-table');
        if (!container) return;
        
        // Mostrar spinner de carregamento
        container.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .select(`
                    *,
                    categories(name)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Erro ao buscar grupos pendentes:', error);
                container.innerHTML = '<tr><td colspan="6" class="text-center">Ocorreu um erro ao carregar os grupos pendentes.</td></tr>';
                return;
            }
            
            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum grupo pendente de aprovação.</td></tr>';
                return;
            }
            
            container.innerHTML = data.map(group => `
                <tr>
                    <td>${group.name}</td>
                    <td>${group.platform}</td>
                    <td>${group.categories.name}</td>
                    <td>${utils.formatDate(group.created_at)}</td>
                    <td><span class="status-badge status-pending">Pendente</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-approve" data-id="${group.id}">Aprovar</button>
                            <button class="btn-action btn-reject" data-id="${group.id}">Rejeitar</button>
                            <button class="btn-action btn-edit" data-id="${group.id}">Editar</button>
                            <button class="btn-action btn-delete" data-id="${group.id}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            // Adicionar event listeners aos botões
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar grupos pendentes:', error);
            container.innerHTML = '<tr><td colspan="6" class="text-center">Ocorreu um erro ao carregar os grupos pendentes.</td></tr>';
        }
    },
    
    // Renderizar tabela de todos os grupos
    async renderAllGroups() {
        const container = document.getElementById('all-groups-table');
        if (!container) return;
        
        // Mostrar spinner de carregamento
        container.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data, error } = await supabase
                .from('groups')
                .select(`
                    *,
                    categories(name)
                `)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Erro ao buscar todos os grupos:', error);
                container.innerHTML = '<tr><td colspan="7" class="text-center">Ocorreu um erro ao carregar os grupos.</td></tr>';
                return;
            }
            
            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum grupo encontrado.</td></tr>';
                return;
            }
            
            container.innerHTML = data.map(group => {
                const statusClass = `status-${group.status}`;
                const statusText = group.status === 'pending' ? 'Pendente' : 
                                  group.status === 'approved' ? 'Aprovado' : 'Rejeitado';
                const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
                
                return `
                    <tr>
                        <td>${group.name} ${vipBadge}</td>
                        <td>${group.platform}</td>
                        <td>${group.categories.name}</td>
                        <td>${group.views || 0}</td>
                        <td>${utils.formatDate(group.created_at)}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                ${group.status === 'pending' ? `<button class="btn-action btn-approve" data-id="${group.id}">Aprovar</button>` : ''}
                                ${group.status === 'pending' ? `<button class="btn-action btn-reject" data-id="${group.id}">Rejeitar</button>` : ''}
                                <button class="btn-action btn-edit" data-id="${group.id}">Editar</button>
                                <button class="btn-action btn-delete" data-id="${group.id}">Excluir</button>
                                ${!group.isVIP ? `<button class="btn-action btn-vip" data-id="${group.id}">Tornar VIP</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Adicionar event listeners aos botões
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar todos os grupos:', error);
            container.innerHTML = '<tr><td colspan="7" class="text-center">Ocorreu um erro ao carregar os grupos.</td></tr>';
        }
    },
    
    // Renderizar formulário de edição de grupo
    async renderEditGroupForm(groupId) {
        const container = document.getElementById('edit-group-form-container');
        if (!container) return;
        
        // Mostrar spinner de carregamento
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const group = await db.getGroupById(groupId);
            
            if (!group) {
                container.innerHTML = '<p class="text-center">Grupo não encontrado.</p>';
                return;
            }
            
            // Carregar categorias
            const categories = await db.getCategories();
            
            container.innerHTML = `
                <form id="edit-group-form" class="admin-form">
                    <input type="hidden" id="group-id" value="${group.id}">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Nome do Grupo</label>
                            <input type="text" id="name" name="name" class="form-control" value="${group.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="platform">Plataforma</label>
                            <select id="platform" name="platform" class="form-control" required>
                                <option value="WhatsApp" ${group.platform === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                                <option value="Telegram" ${group.platform === 'Telegram' ? 'selected' : ''}>Telegram</option>
                                <option value="Discord" ${group.platform === 'Discord' ? 'selected' : ''}>Discord</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="category">Categoria</label>
                            <select id="category" name="category" class="form-control" required>
                                ${categories.map(category => `
                                    <option value="${category.id}" ${group.category === category.id ? 'selected' : ''}>${category.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" class="form-control" required>
                                <option value="pending" ${group.status === 'pending' ? 'selected' : ''}>Pendente</option>
                                <option value="approved" ${group.status === 'approved' ? 'selected' : ''}>Aprovado</option>
                                <option value="rejected" ${group.status === 'rejected' ? 'selected' : ''}>Rejeitado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Descrição</label>
                        <textarea id="description" name="description" class="form-control" required>${group.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="invite_link">Link de Convite</label>
                        <input type="url" id="invite_link" name="invite_link" class="form-control" value="${group.invite_link}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="isVIP" name="isVIP" ${group.isVIP ? 'checked' : ''}>
                            Marcar como VIP
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                        <button type="button" id="cancel-edit" class="btn btn-outline">Cancelar</button>
                    </div>
                </form>
            `;
            
            // Adicionar event listener ao formulário
            document.getElementById('edit-group-form').addEventListener('submit', this.handleEditGroupSubmit);
            
            // Adicionar event listener ao botão cancelar
            document.getElementById('cancel-edit').addEventListener('click', () => {
                document.getElementById('edit-group-modal').style.display = 'none';
            });
        } catch (error) {
            console.error('Erro ao renderizar formulário de edição:', error);
            container.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar o formulário de edição.</p>';
        }
    },
    
    // Adicionar event listeners aos botões de ação dos grupos
    attachGroupActionListeners() {
        // Botão Aprovar
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.getAttribute('data-id');
                const success = await this.approveGroup(groupId);
                
                if (success) {
                    utils.showToast('Grupo aprovado com sucesso!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                } else {
                    utils.showToast('Ocorreu um erro ao aprovar o grupo.', 'error');
                }
            });
        });
        
        // Botão Rejeitar
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.getAttribute('data-id');
                const success = await this.rejectGroup(groupId);
                
                if (success) {
                    utils.showToast('Grupo rejeitado com sucesso!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                } else {
                    utils.showToast('Ocorreu um erro ao rejeitar o grupo.', 'error');
                }
            });
        });
        
        // Botão Editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.getAttribute('data-id');
                await this.renderEditGroupForm(groupId);
                
                // Mostrar modal de edição
                const modal = document.getElementById('edit-group-modal');
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        });
        
        // Botão Excluir
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.getAttribute('data-id');
                
                if (confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
                    const success = await this.deleteGroup(groupId);
                    
                    if (success) {
                        utils.showToast('Grupo excluído com sucesso!', 'success');
                        this.renderPendingGroups();
                        this.renderAllGroups();
                    } else {
                        utils.showToast('Ocorreu um erro ao excluir o grupo.', 'error');
                    }
                }
            });
        });
        
        // Botão Tornar VIP
        document.querySelectorAll('.btn-vip').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.getAttribute('data-id');
                const success = await this.makeGroupVIP(groupId);
                
                if (success) {
                    utils.showToast('Grupo marcado como VIP com sucesso!', 'success');
                    this.renderAllGroups();
                } else {
                    utils.showToast('Ocorreu um erro ao marcar o grupo como VIP.', 'error');
                }
            });
        });
    },
    
    // Aprovar grupo
    async approveGroup(groupId) {
        const result = await db.updateGroup(groupId, { status: 'approved' });
        return !!result;
    },
    
    // Rejeitar grupo
    async rejectGroup(groupId) {
        const result = await db.updateGroup(groupId, { status: 'rejected' });
        return !!result;
    },
    
    // Excluir grupo
    async deleteGroup(groupId) {
        const success = await db.deleteGroup(groupId);
        return success;
    },
    
    // Tornar grupo VIP
    async makeGroupVIP(groupId) {
        const result = await db.updateGroup(groupId, { isVIP: true });
        return !!result;
    },
    
    // Lidar com submissão do formulário de edição
    async handleEditGroupSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const groupId = formData.get('group-id');
        
        const groupData = {
            name: formData.get('name'),
            platform: formData.get('platform'),
            category: formData.get('category'),
            description: formData.get('description'),
            invite_link: formData.get('invite_link'),
            status: formData.get('status'),
            isVIP: formData.get('isVIP') === 'on'
        };
        
        // Validar dados
        if (!groupData.name || !groupData.platform || !groupData.category || !groupData.description || !groupData.invite_link) {
            utils.showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        // Desabilitar botão de envio
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
        
        try {
            const result = await db.updateGroup(groupId, groupData);
            
            if (result) {
                utils.showToast('Grupo atualizado com sucesso!', 'success');
                document.getElementById('edit-group-modal').style.display = 'none';
                this.renderPendingGroups();
                this.renderAllGroups();
            } else {
                utils.showToast('Ocorreu um erro ao atualizar o grupo.', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar grupo:', error);
            utils.showToast('Ocorreu um erro ao atualizar o grupo.', 'error');
        } finally {
            // Reabilitar botão de envio
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },
    
    // Renderizar formulário de categoria
    async renderCategoryForm() {
        const container = document.getElementById('category-form-container');
        if (!container) return;
        
        container.innerHTML = `
            <form id="category-form" class="admin-form">
                <div class="form-group">
                    <label for="category-name">Nome da Categoria</label>
                    <input type="text" id="category-name" name="name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Adicionar Categoria</button>
                </div>
            </form>
            
            <h3>Categorias Existentes</h3>
            <div id="categories-list">
                <div class="spinner"></div>
            </div>
        `;
        
        // Adicionar event listener ao formulário
        document.getElementById('category-form').addEventListener('submit', this.handleCategorySubmit);
        
        // Carregar categorias existentes
        this.renderCategoriesList();
    },
    
    // Renderizar lista de categorias
    async renderCategoriesList() {
        const container = document.getElementById('categories-list');
        if (!container) return;
        
        try {
            const categories = await db.getCategories();
            
            if (categories.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhuma categoria encontrada.</p>';
                return;
            }
            
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(category => `
                            <tr>
                                <td>${category.id}</td>
                                <td>${category.name}</td>
                                <td>
                                    <button class="btn-action btn-delete" data-category-id="${category.id}">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            // Adicionar event listeners aos botões de excluir
            container.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const categoryId = btn.getAttribute('data-category-id');
                    
                    if (confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
                        const success = await this.deleteCategory(categoryId);
                        
                        if (success) {
                            utils.showToast('Categoria excluída com sucesso!', 'success');
                            this.renderCategoriesList();
                        } else {
                            utils.showToast('Ocorreu um erro ao excluir a categoria.', 'error');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao renderizar categorias:', error);
            container.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar as categorias.</p>';
        }
    },
    
    // Lidar com submissão do formulário de categoria
    async handleCategorySubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const categoryName = formData.get('name');
        
        // Validar dados
        if (!categoryName) {
            utils.showToast('Por favor, informe o nome da categoria.', 'error');
            return;
        }
        
        // Desabilitar botão de envio
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adicionando...';
        
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: categoryName }])
                .select();
            
            if (error) {
                console.error('Erro ao adicionar categoria:', error);
                utils.showToast('Ocorreu um erro ao adicionar a categoria.', 'error');
            } else if (data && data.length > 0) {
                utils.showToast('Categoria adicionada com sucesso!', 'success');
                e.target.reset();
                this.renderCategoriesList();
            }
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            utils.showToast('Ocorreu um erro ao adicionar a categoria.', 'error');
        } finally {
            // Reabilitar botão de envio
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },
    
    // Excluir categoria
    async deleteCategory(categoryId) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) {
            console.error('Erro ao excluir categoria:', error);
            return false;
        }
        
        return true;
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário é admin
    const isAdmin = await auth.isAdmin();
    if (!isAdmin) {
        window.location.href = 'login.html?redirect=admin.html';
        return;
    }
    
    // Renderizar grupos pendentes
    await admin.renderPendingGroups();
    
    // Renderizar todos os grupos
    await admin.renderAllGroups();
    
    // Renderizar formulário de categoria
    await admin.renderCategoryForm();
    
    // Configurar navegação por abas
    const navLinks = document.querySelectorAll('.admin-sidebar a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover classe active de todos os links e seções
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');
            
            // Adicionar classe active ao link clicado
            link.classList.add('active');
            
            // Mostrar seção correspondente
            const sectionId = link.getAttribute('href').substring(1);
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
    });
    
    // Configurar modal de edição
    const modal = document.getElementById('edit-group-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Exportar para uso em outros arquivos
window.admin = admin;
