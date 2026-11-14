import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "../tela-auth/src/contexts/AuthContext"
import { api } from "../tela-auth/src/services/api"
import "./AdminDashboard.css"

const EMPTY_FORM = { nome: "", email: "", cpf: "", role: "ROLE_CUIDADOR", senha: "" }

const ROLE_LABELS = {
  ROLE_ADMIN: "Administrador",
  ROLE_CUIDADOR: "Cuidador",
  ROLE_IDOSO: "Idoso",
  ROLE_USER: "Usuário legado",
}

const formatDate = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR")
}

function AdminDashboard() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [links, setLinks] = useState([])
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [userList, linkList] = await Promise.all([api.listAdminUsers(), api.listAdminLinks()])
      setUsers(Array.isArray(userList) ? userList : [])
      setLinks(Array.isArray(linkList) ? linkList : [])
    } catch (loadError) {
      console.error("Falha ao carregar dados administrativos", loadError)
      setError(loadError.message || "Não foi possível carregar os dados administrativos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => {
      const matchesText = !normalizedQuery || [
        user.nome,
        user.email,
        user.cpf,
      ].some((value) => String(value || "").toLowerCase().includes(normalizedQuery))
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.ativo === (statusFilter === "active")
      return matchesText && matchesRole && matchesStatus
    })
  }, [users, query, roleFilter, statusFilter])

  const counts = useMemo(() => ({
    all: users.length,
    elderly: users.filter((user) => user.role === "ROLE_IDOSO").length,
    caregivers: users.filter((user) => user.role === "ROLE_CUIDADOR").length,
    pendingLinks: links.filter((link) => link.status === "PENDING").length,
    activeLinks: links.filter((link) => link.status === "ACCEPTED").length,
  }), [users, links])

  const openCreateForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  const openEditForm = (user) => {
    setEditingId(user.id)
    setForm({
      nome: user.nome || "",
      email: user.email || "",
      cpf: user.cpf || "",
      role: user.role,
      senha: "",
    })
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf.replace(/\D/g, "") || null,
        role: form.role,
        senha: form.senha || null,
      }
      if (editingId) {
        await api.updateAdminUser(editingId, payload)
        setSuccess("Dados da conta atualizados.")
      } else {
        await api.createAdminUser(payload)
        setSuccess("Conta criada. O usuário poderá concluir o perfil ao entrar.")
      }
      setShowForm(false)
      await loadDashboard()
    } catch (saveError) {
      console.error("Falha ao salvar usuário pelo painel administrativo", saveError)
      setError(saveError.message || "Não foi possível salvar a conta.")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (user) => {
    const action = user.ativo ? "desativar" : "reativar"
    if (!window.confirm(`Deseja ${action} a conta de ${user.nome}?`)) return
    setError("")
    setSuccess("")
    try {
      await api.updateAdminUserStatus(user.id, !user.ativo)
      setSuccess(`Conta ${user.ativo ? "desativada" : "reativada"} com sucesso.`)
      await loadDashboard()
    } catch (statusError) {
      console.error(`Falha ao ${action} conta`, statusError)
      setError(statusError.message || `Não foi possível ${action} esta conta.`)
    }
  }

  const roleLabel = ROLE_LABELS[currentUser?.role === "admin" ? "ROLE_ADMIN" : currentUser?.role] || "Administrador"

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Senior+ · Administração</span>
          <h1>Painel administrativo</h1>
          <p>Contas, perfis e vínculos entre idosos e cuidadores.</p>
        </div>
        <div className="admin-identity">
          <span>{currentUser?.name || currentUser?.email}</span>
          <small>{roleLabel}</small>
        </div>
      </header>

      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
      {success && <div className="admin-alert admin-alert--success" role="status">{success}</div>}

      <section className="admin-stats" aria-label="Resumo de contas e vínculos">
        <article><span>Contas</span><strong>{counts.all}</strong></article>
        <article><span>Idosos</span><strong>{counts.elderly}</strong></article>
        <article><span>Cuidadores</span><strong>{counts.caregivers}</strong></article>
        <article><span>Vínculos ativos</span><strong>{counts.activeLinks}</strong></article>
        <article><span>Solicitações pendentes</span><strong>{counts.pendingLinks}</strong></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Contas de usuários</h2>
            <p>Senhas nunca são exibidas. Desativar preserva os dados e bloqueia novos acessos.</p>
          </div>
          <button type="button" className="admin-primary-button" onClick={openCreateForm}>Adicionar conta</button>
        </div>

        <div className="admin-filters">
          <label>
            Buscar
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, e-mail ou CPF" />
          </label>
          <label>
            Perfil
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">Todos os perfis</option>
              <option value="ROLE_IDOSO">Idosos</option>
              <option value="ROLE_CUIDADOR">Cuidadores</option>
              <option value="ROLE_ADMIN">Administradores</option>
              <option value="ROLE_USER">Usuários legados</option>
            </select>
          </label>
          <label>
            Situação
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="inactive">Desativadas</option>
            </select>
          </label>
        </div>

        {showForm && (
          <form className="admin-user-form" onSubmit={handleSubmit}>
            <div className="admin-form-heading">
              <h3>{editingId ? "Editar conta" : "Nova conta"}</h3>
              <button type="button" className="admin-text-button" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
            <div className="admin-form-grid">
              <label>Nome<input required maxLength="255" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} /></label>
              <label>E-mail<input required type="email" maxLength="255" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>CPF<input required={form.role !== "ROLE_ADMIN"} inputMode="numeric" maxLength="14" value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })} /></label>
              <label>Perfil
                <select value={form.role} disabled={editingId && form.role === "ROLE_ADMIN"} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="ROLE_CUIDADOR">Cuidador</option>
                  <option value="ROLE_IDOSO">Idoso</option>
                  {editingId && form.role === "ROLE_ADMIN" && <option value="ROLE_ADMIN">Administrador</option>}
                </select>
              </label>
              <label className="admin-password-field">
                {editingId ? "Nova senha (opcional)" : "Senha inicial"}
                <input
                  type="password"
                  autoComplete="new-password"
                  required={!editingId}
                  minLength="12"
                  maxLength="72"
                  value={form.senha}
                  onChange={(event) => setForm({ ...form, senha: event.target.value })}
                  placeholder={editingId ? "Deixe em branco para manter" : "Mínimo de 12 caracteres"}
                />
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-primary-button" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar conta"}
              </button>
            </div>
          </form>
        )}

        {loading ? <p className="admin-empty">Carregando contas...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Usuário</th><th>Perfil</th><th>Situação</th><th>Ações</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.nome}</strong><span>{user.email}</span><small>CPF: {user.cpf || "Não informado"}</small></td>
                    <td><span className={`admin-role admin-role--${String(user.role).toLowerCase()}`}>{ROLE_LABELS[user.role] || user.role}</span></td>
                    <td><span className={`admin-status ${user.ativo ? "is-active" : "is-inactive"}`}>{user.ativo ? "Ativa" : "Desativada"}</span></td>
                    <td className="admin-row-actions">
                      <button type="button" className="admin-text-button" onClick={() => openEditForm(user)}>Editar</button>
                      <button type="button" className="admin-text-button" onClick={() => toggleActive(user)}>{user.ativo ? "Desativar" : "Reativar"}</button>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && <tr><td colSpan="4" className="admin-empty">Nenhuma conta corresponde aos filtros.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><h2>Vínculos entre idosos e cuidadores</h2><p>Solicitações e vínculos diretos registrados no sistema.</p></div>
          <button type="button" className="admin-secondary-button" onClick={loadDashboard} disabled={loading}>Atualizar</button>
        </div>
        {loading ? <p className="admin-empty">Carregando vínculos...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Idoso</th><th>Cuidador</th><th>Estado</th><th>Origem</th><th>Atualizado</th></tr></thead>
              <tbody>
                {links.map((link, index) => (
                  <tr key={`${link.origem}-${link.idosoCpf}-${link.cuidadorCpf}-${index}`}>
                    <td><strong>{link.idosoNome}</strong><small>CPF: {link.idosoCpf}</small></td>
                    <td><strong>{link.cuidadorNome}</strong><small>CPF: {link.cuidadorCpf}</small></td>
                    <td><span className={`admin-status admin-status--${String(link.status).toLowerCase()}`}>{link.status}</span></td>
                    <td>{link.origem === "DIRETO" ? "Vínculo direto" : "Solicitação"}</td>
                    <td>{formatDate(link.atualizadoEm)}</td>
                  </tr>
                ))}
                {!links.length && <tr><td colSpan="5" className="admin-empty">Nenhum vínculo ou solicitação encontrado.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard
