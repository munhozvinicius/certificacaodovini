# 🚀 Guia de Deploy na Vercel

## Repositório GitHub
✅ **Código já está no GitHub**: https://github.com/munhozvinicius/certificacaodovini

## Passos para Deploy na Vercel

### 1. Acessar a Vercel
1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub

### 2. Importar Projeto
1. Clique em **"Add New Project"** ou **"Import Project"**
2. Selecione o repositório: **certificacaodovini**
3. Clique em **"Import"**

### 3. Configurações do Projeto

#### Build Settings
A Vercel detectará automaticamente que é um projeto Vite, mas confirme:

```
Framework Preset: Vite
Build Command: cd client && npm install && npm run build
Output Directory: client/dist
Install Command: cd client && npm install
```

#### Root Directory
- Deixe vazio (raiz do projeto)
- O arquivo `vercel.json` já está configurado

#### Environment Variables
- Nenhuma variável de ambiente é necessária (por enquanto)

### 4. Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (leva cerca de 2-3 minutos)
3. Após o deploy, você receberá uma URL como: `https://certificacaodovini.vercel.app`

### 5. Configurações Opcionais

#### Domínio Customizado
1. Vá em **Settings** > **Domains**
2. Adicione seu domínio customizado (se tiver)

#### Ajustes de Build (se necessário)
Se houver algum problema no build, você pode ajustar em:
- **Settings** > **General** > **Build & Development Settings**

## Estrutura do Projeto para Vercel

```
certificacaodovini/
├── client/              # Aplicação React
│   ├── src/            # Código fonte
│   ├── dist/           # Build (gerado automaticamente)
│   └── package.json    # Dependências
├── vercel.json         # Configuração da Vercel
└── README.md           # Documentação
```

## Verificações Pós-Deploy

Após o deploy, teste:
- ✅ Página inicial carrega
- ✅ Navegação entre abas funciona
- ✅ Importação de planilhas funciona
- ✅ Cálculos são exibidos corretamente
- ✅ Simulador funciona
- ✅ Página de créditos exibe corretamente

## Comandos Úteis

### Build Local (para testar antes do deploy)
```bash
cd client
npm run build
npm run preview
```

### Vercel CLI (opcional)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy via CLI
vercel

# Deploy para produção
vercel --prod
```

## Troubleshooting

### Build falha na Vercel
1. Verifique o log de build na Vercel
2. Confirme que o `vercel.json` está correto
3. Teste o build localmente: `cd client && npm run build`

### Rotas não funcionam (404)
- O `vercel.json` já está configurado com rewrites
- Todas as rotas apontam para `/index.html` (SPA)

### Erro de dependências
- Certifique-se que `package-lock.json` está commitado
- Verifique se todas as dependências estão em `package.json`

## Links Úteis

- 📚 Documentação Vercel: https://vercel.com/docs
- 🚀 Deploy Vite na Vercel: https://vercel.com/docs/frameworks/vite
- 📊 Dashboard Vercel: https://vercel.com/dashboard

## Status

✅ Código no GitHub
✅ `.gitignore` configurado
✅ `vercel.json` criado
✅ README.md com documentação
✅ Pronto para deploy!

---

**Repositório**: https://github.com/munhozvinicius/certificacaodovini
**Deploy URL**: https://certificacaodovini.vercel.app (após deploy)
