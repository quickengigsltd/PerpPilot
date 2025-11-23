import React, { useState } from 'react';

interface TokenIconProps {
  pair: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({ pair, size = 'md', className = '' }) => {
  const [error, setError] = useState(false);
  
  // Extract symbol (e.g., 'BTC' from 'BTC/USDT')
  const symbol = pair.split('/')[0].toLowerCase();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getIconUrl = (sym: string) => {
    // Specific override for RUNE
    if (sym === 'rune') {
      return 'https://thorchain.org/images/services/your-thorchad.png';
    }
    // Using a reliable CDN for cryptocurrency icons
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${sym}.png`;
  };

  const fallbackUrl = `https://ui-avatars.com/api/?name=${symbol.toUpperCase()}&background=random&color=fff&size=128`;

  return (
    <div className={`relative flex-shrink-0 rounded-full overflow-hidden bg-white/10 ${sizeClasses[size]} ${className}`}>
      <img 
        src={error ? fallbackUrl : getIconUrl(symbol)} 
        alt={symbol}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default TokenIcon;