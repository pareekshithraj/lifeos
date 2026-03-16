
import React from 'react';

interface SovereignAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  active?: boolean;
  plan?: string;
}

const SovereignAvatar: React.FC<SovereignAvatarProps> = ({ 
  name, 
  avatar, 
  size = 'md', 
  onClick, 
  className = '',
  active = false,
  plan = 'Disciple'
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px] rounded-lg',
    sm: 'w-8 h-8 text-[10px] rounded-xl',
    md: 'w-12 h-12 text-sm rounded-2xl',
    lg: 'w-14 h-14 text-lg rounded-[1.2rem]',
    xl: 'w-32 h-32 md:w-36 md:h-36 text-4xl md:text-5xl rounded-[2.5rem] md:rounded-[3rem]'
  };

  const getPlanStyles = () => {
    const p = plan.toLowerCase();
    if (p === 'sage') return "ring-4 ring-amber-400/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    if (p === 'architect') return "ring-4 ring-indigo-400/20 border-2 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]";
    return "ring-4 ring-slate-900/5 border border-slate-200";
  };

  const baseStyles = "shrink-0 flex items-center justify-center bg-slate-900 text-white font-black overflow-hidden transition-all duration-300";
  const planStyles = active || size === 'xl' ? getPlanStyles() : "border border-slate-100";
  const clickableStyles = onClick ? "cursor-pointer hover:scale-105 active:scale-95" : "";

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${sizeClasses[size]} ${planStyles} ${clickableStyles} ${className}`}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        name ? name.charAt(0).toUpperCase() : '?'
      )}
    </div>
  );
};

export default SovereignAvatar;
