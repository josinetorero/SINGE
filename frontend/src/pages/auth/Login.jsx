
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  MapPin,
  BellRing,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Preenche o email e a palavra-passe para continuar.");
      return;
    }

    // Demonstração: ainda não envia credenciais para o Laravel.
    navigate("/operador/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <div className="brand-mark login-brand-mark">
            <Activity size={27} strokeWidth={2.5} />
          </div>

          <div>
            <h1>SINGE</h1>
            <p>Gestão e Coordenação de Emergências</p>
          </div>
        </div>

        <div className="login-intro">
          

          <h2>
            Uma resposta
            <br />
            mais rápida.
            <br />
            <span>Mais vidas protegidas.</span>
          </h2>

          <p>
            Uma plataforma para registar ocorrências, coordenar equipas
            de resposta e acompanhar situações de emergência.
          </p>

          <div className="login-feature-list">
            <div className="login-feature">
              <div className="feature-icon">
                <MapPin size={20} />
              </div>
              <div>
                <strong>Monitorização de ocorrências</strong>
                <span>Acompanhe situações e localizações.</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon">
                <BellRing size={20} />
              </div>
              <div>
                <strong>Coordenação de resposta</strong>
                <span>Organize missões e equipas.</span>
              </div>
            </div>

          </div>
        </div>

        <div className="login-brand-footer">
          SINGE · Protótipo académico
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="mobile-login-brand">
            <div className="brand-mark">
              <Activity size={24} />
            </div>
            <strong>SINGE</strong>
          </div>

          <span className="form-eyebrow">BEM-VINDO DE VOLTA</span>
          <h2>Iniciar sessão</h2>
          <p className="login-description">
            Introduz os teus dados para aceder à plataforma.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email">Email institucional</label>
              <input
                id="email"
                type="email"
                placeholder="nome@instituicao.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="password">Palavra-passe</label>
                <span className="field-hint">Acesso seguro</span>
              </div>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Introduz a tua palavra-passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Ocultar palavra-passe"
                      : "Mostrar palavra-passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="login-submit">
              Entrar na plataforma
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={18} />
            <span>As permissões serão geridas de acordo com o perfil.</span>
          </div>

          <div className="login-help">
            <span>Problemas de acesso?</span>
            <a href="mailto:suporte@singe.local">
              Contacta o administrador
            </a>
          </div>

          <p className="login-legal">
            Ao continuar, estás a utilizar o protótipo académico do SINGE.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
