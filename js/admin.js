// js/admin.js
const admin = {
    // Verificar se é admin
    async checkAdmin() {
        try {
            const isAdmin = await db.isAdmin();
            if (!isAdmin) {
                utils.showToast('Acesso negado. Apenas administradores.', 'error');
                setTimeout(() => {
                    window.location.href = config.getRelativePath('login');
                }, 2000);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            return false;
        }
    },

    // Renderizar grupos pendentes
    async renderPendingGroups() {
        const container = document.getElementById('pending-groups-table');
        if (!container) return;
        
        container.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data: groups, error } = await supabaseClient
                .from('groups')
                .select('*, categories(name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (!groups || groups.length === 0) {
                container.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum grupo pendente</td></tr>';
                return;
            }
            
            container.innerHTML = groups.map(group => `
                <tr>
                    <td>${group.name}</td>
                    <td>${group.platform}</td>
                    <td>${group.categories?.name || 'N/A'}</td>
                    <td>${new Date(group.created_at).toLocaleDateString('pt-BR')}</td>
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
            
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar grupos pendentes:', error);
            container.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar</td></tr>';
        }
    },

    // Renderizar todos os grupos
    async renderAllGroups() {
        const container = document.getElementById('all-groups-table');
        if (!container) return;
        
        container.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner"></div></td></tr>';
        
        try {
            const { data: groups, error } = await supabaseClient
                .from('groups')
                .select('*, categories(name)')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (!groups || groups.length === 0) {
                container.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum grupo encontrado</td></tr>';
                return;
            }
            
            container.innerHTML = groups.map(group => {
                const statusClass = `status-${group.status}`;
                const statusText = group.status === 'pending' ? 'Pendente' : 
                                  group.status === 'approved' ? 'Aprovado' : 'Rejeitado';
                const vipBadge = group.isVIP ? '<span class="vip-badge">VIP</span>' : '';
                
                return `
                    <tr>
                        <td>${group.name} ${vipBadge}</td>
                        <td>${group.platform}</td>
                        <td>${group.categories?.name || 'N/A'}</td>
                        <td>${group.views || 0}</td>
                        <td>${new Date(group.created_at).toLocaleDateString('pt-BR')}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                ${group.status === 'pending' ? `
                                    <button class="btn-action btn-approve" data-id="${group.id}">Aprovar</button>
                                    <button class="btn-action btn-reject" data-id="${group.id}">Rejeitar</button>
                                ` : ''}
                                <button class="btn-action btn-edit" data-id="${group.id}">Editar</button>
                                <button class="btn-action btn-delete" data-id="${group.id}">Excluir</button>
                                ${!group.isVIP ? `<button class="btn-action btn-vip" data-id="${group.id}">Tornar VIP</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            this.attachGroupActionListeners();
        } catch (error) {
            console.error('Erro ao renderizar todos os grupos:', error);
            container.innerHTML = '<tr><td colspan="7" class="text-center">Erro ao carregar</td></tr>';
        }
    },

    // Anexar listeners aos botões
    attachGroupActionListeners() {
        // Aprovar
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.id;
                const success = await this.updateGroupStatus(groupId, 'approved');
                if (success) {
                    utils.showToast('Grupo aprovado!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                }
            });
        });

        // Rejeitar
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.id;
                const success = await this.updateGroupStatus(groupId, 'rejected');
                if (success) {
                    utils.showToast('Grupo rejeitado!', 'success');
                    this.renderPendingGroups();
                    this.renderAllGroups();
                }
            });
        });

        // Editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.id;
                await this.showEditModal(groupId);
            });
        });

        // Excluir
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.id;
                if (confirm('Tem certeza que deseja excluir este grupo?')) {
                    const success = await this.deleteGroup(groupId);
                    if (success) {
                        utils.showToast('Grupo excluído!', 'success');
                        this.renderPendingGroups();
                        this.renderAllGroups();
                    }
                }
            });
        });

        // Tornar VIP
        document.querySelectorAll('.btn-vip').forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.id;
                const success = await this.makeGroupVIP(groupId);
                if (success) {
                    utils.showToast('Grupo marcado como VIP!', 'success');
                    this.renderAllGroups();
                }
            });
        });
    },

    // Atualizar status do grupo
    async updateGroupStatus(groupId, status) {
        try {
            const { error } = await supabaseClient
                .from('groups')
                .update({ status })
                .eq('id', groupId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            utils.showToast('Erro: ' + error.message, 'error');
            return false;
        }
    },

    // Tornar grupo VIP
    async makeGroupVIP(groupId) {
        try {
            const { error } = await supabaseClient
                .from('groups')
                .update({ isVIP: true })
                .eq('id', groupId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao tornar VIP:', error);
            utils.showToast('Erro: ' + error.message, 'error');
            return false;
        }
    },

    // Excluir grupo
    async deleteGroup(groupId) {
        try {
            const { error } = await supabaseClient
                .from('groups')
                .delete()
                .eq('id', groupId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao excluir:', error);
            utils.showToast('Erro: ' + error.message, 'error');
            return false;
        }
    },

    // Mostrar modal de edição
    async showEditModal(groupId) {
        const container = document.getElementById('edit-group-form-container');
        const modal = document.getElementById('edit-group-modal');
        
        if (!container || !modal) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        modal.style.display = 'flex';
        
        try {
            // Obter grupo
            const { data: group, error: groupError } = await supabaseClient
                .from('groups')
                .select('*, categories(name)')
                .eq('id', groupId)
                .single();
            
            if (groupError) throw groupError;
            
            // Obter categorias
            const { data: categories, error: catError } = await supabaseClient
                .from('categories')
                .select('*')
                .order('name');
            
            if (catError) throw catError;
            
            // Renderizar formulário
            container.innerHTML = `
                <form id="edit-group-form">
                    <input type="hidden" id="group-id" value="${group.id}">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-name">Nome</label>
                            <input type="text" id="edit-name" class="form-control" value="${group.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-platform">Plataforma</label>
                            <select id="edit-platform" class="form-control" required>
                                <option value="WhatsApp" ${group.platform === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                                <option value="Telegram" ${group.platform === 'Telegram' ? 'selected' : ''}>Telegram</option>
                                <option value="Discord" ${group.platform === 'Discord' ? 'selected' : ''}>Discord</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-category">Categoria</label>
                            <select id="edit-category" class="form-control" required>
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${group.category === cat.id ? 'selected' : ''}>
                                        ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-status">Status</label>
                            <select id="edit-status" class="form-control" required>
                                <option value="pending" ${group.status === 'pending' ? 'selected' : ''}>Pendente</option>
                                <option value="approved" ${group.status === 'approved' ? 'selected' : ''}>Aprovado</option>
                                <option value="rejected" ${group.status === 'rejected' ? 'selected' : ''}>Rejeitado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-description">Descrição</label>
                        <textarea id="edit-description" class="form-control" rows="4" required>${group.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-invite-link">Link de Convite</label>
                        <input type="url" id="edit-invite-link" class="form-control" value="${group.invite_link}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-isVIP" ${group.isVIP ? 'checked' : ''}>
                            Marcar como VIP
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Salvar</button>
                        <button type="button" id="cancel-edit" class="btn btn-outline">Cancelar</button>
                    </div>
                </form>
            `;
            
            // Configurar submit
            document.getElementById('edit-group-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditSubmit(groupId);
            });
            
            // Configurar cancelar
            document.getElementById('cancel-edit').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
        } catch (error) {
            console.error('Erro ao carregar formulário:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar formulário</p>';
        }
    },

    // Lidar com edição
    async handleEditSubmit(groupId) {
        try {
            const formData = {
                name: document.getElementById('edit-name').value,
                platform: document.getElementById('edit-platform').value,
                category: document.getElementById('edit-category').value,
                description: document.getElementById('edit-description').value,
                invite_link: document.getElementById('edit-invite-link').value,
                status: document.getElementById('edit-status').value,
                isVIP: document.getElementById('edit-isVIP').checked
            };
            
            const { error } = await supabaseClient
                .from('groups')
                .update(formData)
                .eq('id', groupId);
            
            if (error) throw error;
            
            utils.showToast('Grupo atualizado!', 'success');
            document.getElementById('edit-group-modal').style.display = 'none';
            
            this.renderPendingGroups();
            this.renderAllGroups();
            
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            utils.showToast('Erro: ' + error.message, 'error');
        }
    },

    // Renderizar categorias
    async renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;
        
        container.innerHTML = '<div class="spinner"></div>';
        
        try {
            const { data: categories, error } = await supabaseClient
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            if (!categories || categories.length === 0) {
                container.innerHTML = '<p class="text-center">Nenhuma categoria</p>';
                return;
            }
            
            container.innerHTML = categories.map(cat => `
                <div class="category-item">
                    <span>${cat.name}</span>
                    <div>
                        <button class="btn-action btn-delete-category" data-id="${cat.id}">Excluir</button>
                    </div>
                </div>
            `).join('');
            
            // Listeners para excluir categorias
            document.querySelectorAll('.btn-delete-category').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const catId = btn.dataset.id;
                    if (confirm('Excluir esta categoria?')) {
                        const success = await this.deleteCategory(catId);
                        if (success) {
                            utils.showToast('Categoria excluída!', 'success');
                            this.renderCategories();
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error('Erro ao renderizar categorias:', error);
            container.innerHTML = '<p class="text-center">Erro ao carregar</p>';
        }
    },

    // Excluir categoria
    async deleteCategory(categoryId) {
        try {
            // Verificar se há grupos usando esta categoria
            const { data: groups, error: groupsError } = await supabaseClient
                .from('groups')
                .select('id')
                .eq('category', categoryId)
                .limit(1);
            
            if (groupsError) throw groupsError;
            
            if (groups && groups.length > 0) {
                utils.showToast('Não pode excluir: há grupos usando esta categoria', 'error');
                return false;
            }
            
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', categoryId);
            
            if (error) throw error;
            return true;
            
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            utils.showToast('Erro: ' + error.message, 'error');
            return false;
        }
    },

    // Inicializar
    async init() {
        console.log('🛠️ Inicializando painel admin');
        
        // Verificar se é admin
        const isAdmin = await this.checkAdmin();
        if (!isAdmin) return;
        
        // Configurar navegação
        const navLinks = document.querySelectorAll('.admin-sidebar a');
        const sections = document.querySelectorAll('.admin-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover active de todos
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.style.display = 'none');
                
                // Adicionar active
                link.classList.add('active');
                
                // Mostrar seção
                const sectionId = link.getAttribute('href').substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    section.style.display = 'block';
                    
                    // Carregar conteúdo se necessário
                    if (sectionId === 'pending-groups') {
                        this.renderPendingGroups();
                    } else if (sectionId === 'all-groups') {
                        this.renderAllGroups();
                    } else if (sectionId === 'categories') {
                        this.renderCategories();
                    }
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
                    utils.showToast('Digite um nome', 'error');
                    return;
                }
                
                try {
                    const { error } = await supabaseClient
                        .from('categories')
                        .insert([{ name }]);
                    
                    if (error) throw error;
                    
                    utils.showToast('Categoria adicionada!', 'success');
                    nameInput.value = '';
                    this.renderCategories();
                    
                } catch (error) {
                    console.error('Erro ao adicionar categoria:', error);
                    utils.showToast('Erro: ' + error.message, 'error');
                }
            });
        }
        
        // Configurar modal
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
        
        // Carregar grupos pendentes inicialmente
        await this.renderPendingGroups();
        
        console.log('✅ Painel admin inicializado');
    }
};

// Inicializar quando carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar supabaseClient
    await new Promise(resolve => {
        const check = () => {
            if (window.supabaseClient && window.admin) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
    
    await admin.init();
});

window.admin = admin;
