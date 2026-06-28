import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-brand-bg flex flex-col items-center justify-center p-6 md:p-12 selection:bg-red-500/30">
          <div className="w-full max-w-2xl border border-red-500/20 p-8 md:p-12 relative overflow-hidden bg-brand-surface">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertOctagon className="w-8 h-8 text-red-500" />
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-[0.2em] text-red-500 uppercase mb-4 font-mono">
                System Halted
              </h1>
              
              <div className="h-px w-24 bg-red-500/30 mb-8" />
              
              <p className="text-brand-muted text-xs md:text-sm tracking-widest font-mono uppercase mb-8 leading-relaxed max-w-lg">
                Excepción crítica de renderizado. 
                El hilo de ejecución ha sido suspendido para prevenir corrupción de estado.
              </p>

              {this.state.error && (
                <div className="w-full bg-black border border-brand-border p-4 mb-10 text-left overflow-x-auto">
                  <p className="text-red-500/80 font-mono text-[10px] md:text-xs break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="group relative flex items-center justify-center gap-3 w-full md:w-auto px-12 py-4 bg-brand-text text-brand-bg uppercase tracking-[0.3em] text-xs font-bold transition-all hover:bg-white"
              >
                <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" />
                FORZAR REINICIO
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
