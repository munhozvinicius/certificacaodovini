# Certificação Especialista com o Vini

Sistema de acompanhamento da Certificação de Especialistas Vivo Empresas - 2º Ciclo (Julho/2025 a Dezembro/2025).

![Design Glassmorphism](https://img.shields.io/badge/Design-Glassmorphism-8B5CF6)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)

## 🎯 Funcionalidades

- ✅ **Importação Automática de Planilhas**: Suporte para arquivos Excel (.xlsx, .xls, .csv)
- ✅ **Cálculo Automático**: Receita e pontuação por categoria conforme regras Vivo
- ✅ **Dashboard Interativo**: Visualização completa da performance
- ✅ **Simulador de Metas**: Calcule o que é necessário para atingir sua classificação desejada
- ✅ **Design Moderno**: Interface com efeito glassmorphism em tons de púrpura, grafite e preto

## 📋 Regras de Certificação Implementadas

### Classificações
- **Não Certificado**: 0-1.499 pontos (0% bônus)
- **Bronze**: 1.500-3.499 pontos (0% bônus)
- **Prata**: 3.500-5.499 pontos (2,5% bônus)
- **Ouro**: 5.500-7.499 pontos (5,0% bônus)
- **Diamante**: 7.500-9.499 pontos (7,5% bônus)
- **Platinum**: 9.500+ pontos (10,0% bônus)

### Indicadores Avaliados

#### Receitas de Altas (Peso Total: 100%)
- **Dados Avançados (40%)**: Internet Dedicada, VPN IP, Satélite, Vox, Frame Relay
- **Voz Avançada + VVN (40%)**: VVN, SIP, NUM, DDR, 0800
- **Digital/TI (20%)**: Produtos digitais e TI

#### Pontuação Extra
- **Novos Produtos**: Energia, etc.
- **Locação de Equipamentos**
- **Licenças**: Microsoft Office, Google Workspace

### Regras Especiais
- ✅ **Migração não computa receita** (apenas vendas)
- ✅ **Região de Atuação**: Receita fora da área tem redutor de 50%
- ✅ **Valor considerado**: Bruto SN (sem descontos)
- ✅ **Parceiros**: JCL, TECH, SAFE TI

## 🚀 Como Usar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Clone o repositório
cd certificacaodovini

# Instale as dependências
cd client
npm install

# Execute a aplicação
npm run dev
```

A aplicação estará disponível em: [http://localhost:5173](http://localhost:5173)

### Formato das Planilhas

As planilhas devem conter as seguintes colunas:

| Coluna | Descrição | Obrigatório |
|--------|-----------|-------------|
| Data Ativação | Data de ativação do serviço | ✅ |
| Valor Bruto SN | Valor bruto sem desconto | ✅ |
| Tipo | "Venda" ou "Migração" | ✅ |
| Parceiro | "JCL", "TECH" ou "SAFE TI" | ✅ |
| Produto | Nome do produto/serviço | ✅ |
| CNPJ | CNPJ do cliente | ✅ |
| Cliente | Nome do cliente | ✅ |
| Área | "Dentro" ou "Fora" | Opcional |

### Exemplo de Planilha

```
Data Ativação | Valor Bruto SN | Tipo   | Parceiro | Produto          | CNPJ           | Cliente      | Área
01/07/2025    | 1500.00       | Venda  | JCL      | Internet Dedicada | 12.345.678/0001-00 | Empresa X | Dentro
15/07/2025    | 2500.00       | Venda  | TECH     | VPN IP           | 98.765.432/0001-00 | Empresa Y | Fora
```

## 🎨 Design

A aplicação utiliza um design moderno com efeito **glassmorphism** nas cores:
- **Púrpura**: #8B5CF6 (cor principal)
- **Grafite**: Tons de cinza (#1A1A1A, #2E2E2E)
- **Preto**: #050505 (fundo)

### Tema Visual
- ✨ Efeito de vidro fosco (glassmorphism)
- 🌈 Gradientes animados no fundo
- 💫 Transições suaves e animações
- 📱 Design responsivo para mobile

## 📊 Estrutura do Projeto

```
client/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── ImportadorPlanilhas.tsx
│   │   ├── Simulador.tsx
│   │   └── Creditos.tsx
│   ├── types/            # Definições TypeScript
│   │   └── certification.ts
│   ├── utils/            # Utilitários
│   │   ├── calculoCertificacao.ts
│   │   └── importadorPlanilha.ts
│   ├── App.tsx           # Componente principal
│   ├── App.css           # Estilos do App
│   └── index.css         # Estilos globais
└── package.json
```

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework JavaScript
- **TypeScript 5**: Tipagem estática
- **Vite**: Build tool moderna e rápida
- **XLSX**: Processamento de planilhas Excel
- **Lucide React**: Ícones modernos
- **CSS3**: Estilização com variáveis CSS

## 👨‍💻 Desenvolvedor

**Vinicius Munhoz Martins**
- 📧 Email: munhoz.vinicius@gmail.com
- 📱 WhatsApp: +55 17 99723-8888

## 📝 Licença

© 2025 Vinicius Munhoz Martins. Todos os direitos reservados.

---

**Versão**: 1.0.0
**Data**: Outubro 2025
**Ciclo**: 2º Ciclo - Julho/2025 a Dezembro/2025
