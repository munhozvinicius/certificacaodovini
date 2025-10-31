import { Mail, Phone, Award, Heart } from 'lucide-react';
import './Creditos.css';

export default function Creditos() {
  return (
    <div className="creditos-container fade-in">
      <div className="creditos-card glass-card">
        <div className="creditos-header">
          <Award size={48} className="creditos-icon" />
          <h2 className="text-gradient">Certificação Especialista com o Vini</h2>
        </div>

        <div className="creditos-content">
          <div className="creditos-section">
            <h3>Sobre o Aplicativo</h3>
            <p>
              Sistema de acompanhamento da Certificação de Especialistas Vivo Empresas - 2º Ciclo (Julho/2025 a Dezembro/2025).
              Desenvolvido para facilitar o controle de metas, importação de planilhas e simulação de cenários.
            </p>
          </div>

          <div className="creditos-section">
            <h3>Desenvolvido por</h3>
            <div className="desenvolvedor-info">
              <div className="desenvolvedor-nome">
                <strong>Vinicius Munhoz Martins</strong>
              </div>
              <div className="contato-list">
                <a href="mailto:munhoz.vinicius@gmail.com" className="contato-item">
                  <Mail size={18} />
                  <span>munhoz.vinicius@gmail.com</span>
                </a>
                <a href="https://wa.me/5517997238888" target="_blank" rel="noopener noreferrer" className="contato-item">
                  <Phone size={18} />
                  <span>+55 17 99723-8888</span>
                </a>
              </div>
            </div>
          </div>

          <div className="creditos-section">
            <h3>Funcionalidades</h3>
            <ul className="funcionalidades-list">
              <li>Importação automática de planilhas Excel (Ativação Avançados, TI/GUD, Tech)</li>
              <li>Cálculo automático de receita e pontuação por categoria</li>
              <li>Dashboard com visualização detalhada da performance</li>
              <li>Simulador de metas com cálculo de probabilidade</li>
              <li>Aplicação das regras de certificação Vivo Empresas</li>
              <li>Interface moderna com design glassmorphism</li>
            </ul>
          </div>

          <div className="creditos-section">
            <h3>Tecnologias Utilizadas</h3>
            <div className="tech-stack">
              <span className="tech-badge">React</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">XLSX</span>
              <span className="tech-badge">Lucide Icons</span>
            </div>
          </div>

          <div className="creditos-footer">
            <Heart size={16} className="heart-icon" />
            <p>Feito com dedicação para os especialistas Vivo</p>
          </div>
        </div>
      </div>

      <div className="versao-info glass-card">
        <p>Versão 1.0.0 - Outubro 2025</p>
        <p className="copyright">© 2025 Vinicius Munhoz Martins. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
