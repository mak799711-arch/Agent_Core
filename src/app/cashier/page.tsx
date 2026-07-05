'use client';

import { useState } from 'react';

export default function CashierPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  const handleKeyPress = (num: string) => {
    if (code.length < 6) {
      setCode(prev => prev + num);
      setStatus('idle');
    }
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
    setStatus('idle');
  };

  const handleCheck = () => {
    if (code.length !== 6) return;
    setStatus('checking');
    
    // Мокап-проверка: имитируем задержку сети
    setTimeout(() => {
      if (code === '123456') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1000);
  };

  const handleReset = () => {
    setCode('');
    setStatus('idle');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#00e5ff' }}>AgentCore Terminal</h1>
        <p style={{ color: '#888', margin: 0 }}>Введите 6-значный код гостя</p>
      </div>

      {/* Дисплей ввода */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        height: '80px',
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '40px',
        boxShadow: '0 4px 20px rgba(0, 229, 255, 0.1)',
        border: status === 'error' ? '2px solid #ff4444' : status === 'success' ? '2px solid #00c853' : '1px solid #333'
      }}>
        <span style={{ fontSize: '40px', letterSpacing: '8px', fontWeight: '500', fontFamily: 'monospace' }}>
          {code || '------'}
        </span>
      </div>

      {/* Статус */}
      <div style={{ height: '30px', marginBottom: '20px', textAlign: 'center' }}>
        {status === 'checking' && <span style={{ color: '#888' }}>Проверка...</span>}
        {status === 'error' && <span style={{ color: '#ff4444' }}>Код не найден! Попробуйте '123456'</span>}
        {status === 'success' && <span style={{ color: '#00c853', fontWeight: 'bold' }}>Скидка применена! Agent: Maxim</span>}
      </div>

      {/* Клавиатура */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        width: '100%',
        maxWidth: '320px',
        marginBottom: '30px'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            style={{
              height: '70px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '16px',
              fontSize: '28px',
              color: 'var(--foreground)',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleReset}
          style={{
            height: '70px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '16px',
            fontSize: '18px',
            color: '#888',
            cursor: 'pointer'
          }}
        >
          C
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          style={{
            height: '70px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '16px',
            fontSize: '28px',
            color: 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          style={{
            height: '70px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '16px',
            fontSize: '24px',
            color: 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          ⌫
        </button>
      </div>

      {/* Кнопка Проверить */}
      <button
        onClick={handleCheck}
        disabled={code.length !== 6 || status === 'checking' || status === 'success'}
        style={{
          width: '100%',
          maxWidth: '320px',
          height: '60px',
          backgroundColor: code.length === 6 && status !== 'success' ? '#00e5ff' : '#333',
          color: code.length === 6 && status !== 'success' ? '#000' : '#666',
          border: 'none',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: code.length === 6 ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s',
          display: status === 'success' ? 'none' : 'block'
        }}
      >
        Проверить код
      </button>

      {/* Кнопка "Новый клиент" после успеха */}
      {status === 'success' && (
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            maxWidth: '320px',
            height: '60px',
            backgroundColor: '#00c853',
            color: '#000',
            border: 'none',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Следующий гость
        </button>
      )}
    </div>
  );
}
