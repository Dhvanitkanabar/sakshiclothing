import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-stone-950 flex flex-col items-center justify-center px-4 py-6 sm:py-10 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Subtle ambient luxury backdrop glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-[390px] relative z-10">
        <Outlet />
      </div>

      {/* Discreet footer attribution */}
      <div className="mt-5 text-center text-[10px] text-slate-500 font-sans tracking-widest uppercase">
        <span>Sakshi Clothing &bull; Atelier Control Suite</span>
      </div>
    </div>
  );
};

export default AuthLayout;
