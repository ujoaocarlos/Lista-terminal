# Configurar o login

O frontend usa o Supabase Auth e continua funcionando em modo local enquanto as credenciais nao forem configuradas.

## 1. Criar o projeto

1. Acesse https://supabase.com e crie um projeto.
2. Abra **Project Settings > API**.
3. Copie **Project URL** e **anon public key**.

## 2. Preencher a configuracao

Edite `frontend/supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
    url: "https://seu-projeto.supabase.co",
    anonKey: "sua-chave-anon-public"
};
```

A chave `anon public` pode aparecer no frontend. Nunca use a `service_role key` no navegador.

## 3. Configurar URLs de autenticacao

No Supabase, abra **Authentication > URL Configuration** e adicione:

- Site URL: `https://ujoaocarlos.github.io/Lista-terminal/`
- Redirect URL: `https://ujoaocarlos.github.io/Lista-terminal/`

Para testar localmente, adicione tambem a URL usada pelo navegador.

## 4. Ativar login com Google

1. No Google Cloud Console, crie um OAuth Client ID do tipo **Web application**.
2. No Supabase, abra **Authentication > Providers > Google** e ative o provedor.
3. Cole o Client ID e o Client Secret fornecidos pelo Google.
4. No Google Cloud, adicione como redirect URI a URL exibida pelo Supabase em **Authentication > Providers > Google**.

O botao **Continuar com Google** usara automaticamente o usuario retornado pelo Supabase.

## 5. Publicar

```powershell
git add frontend/supabase-config.js SUPABASE_SETUP.md
git commit -m "Configura autenticacao Supabase"
git push
```

Depois do deploy, a tela de login sera exibida. O login, cadastro, recuperacao de senha e logout funcionam pelo Supabase.

> Nesta primeira etapa, os registros continuam no `localStorage` do navegador. Para sincronizar tarefas e financas entre dispositivos e separar os dados por usuario, sera necessario criar tabelas no Supabase e trocar o armazenamento local pela API do banco.
