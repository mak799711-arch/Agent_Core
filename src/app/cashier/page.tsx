'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';

export default function CashierPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'completed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [billAmount, setBillAmount] = useState<number | ''>('');

  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  const handleVerify = async (codeToVerify: string = code) => {
    if (!codeToVerify || codeToVerify.length < 6) return;
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const res = await fetch(`/api/v1/referrals/verify?code=${codeToVerify.toUpperCase()}`);
      const data = await res.json();
      
      if (data.success) {
        setSessionData(data);
        setStatus('verified');
      } else {
        setErrorMsg(data.error || 'Код не найден');
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg('Ошибка сети');
      setStatus('error');
    }
  };

  const handleComplete = async () => {
    if (!billAmount || Number(billAmount) <= 0) {
      setErrorMsg('Введите корректную сумму чека');
      return;
    }
    
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/v1/referrals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          billAmount: Number(billAmount)
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus('completed');
      } else {
        setErrorMsg(data.error || 'Ошибка при проведении транзакции');
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg('Ошибка сети');
      setStatus('error');
    }
  };

  const calculateDiscount = () => {
    if (!sessionData || !billAmount) return 0;
    const discountPercent = sessionData.offer.customerDiscountPercent || 0;
    return (Number(billAmount) * discountPercent) / 100;
  };

  const calculateTotal = () => {
    if (!billAmount) return 0;
    return Number(billAmount) - calculateDiscount();
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      // @ts-ignore
      if (window.Html5QrcodeScanner) {
        // @ts-ignore
        const scanner = new window.Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        scannerRef.current = scanner;
        scanner.render((text: string) => {
           setCode(text);
           setIsScanning(false);
           scanner.clear();
           // Auto verify when scanned
           handleVerify(text);
        }, (err: any) => {
           // ignore errors during scanning (usually just means no QR found yet)
        });
      }
    }, 200);
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Script src="https://unpkg.com/html5-qrcode" strategy="lazyOnload" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Касса (AgentCore)</h1>
          <p className="text-blue-100 mt-1">Оффлайн-трекинг</p>
        </div>

        <div className="p-6">
          {status === 'error' && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {isScanning && (
             <div className="mb-4">
               <div id="reader" style={{ width: '100%' }}></div>
               <button 
                 onClick={stopScanner}
                 className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
               >
                 Отменить сканирование
               </button>
             </div>
          )}

          {!isScanning && (status === 'idle' || status === 'error') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код гостя (6 символов)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full text-center text-3xl tracking-widest uppercase p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition"
                    placeholder="XXXXXX"
                  />
                  <button 
                    onClick={startScanner}
                    className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition text-2xl"
                    title="Сканировать QR"
                  >
                    📷
                  </button>
                </div>
              </div>
              <button 
                onClick={() => handleVerify(code)}
                disabled={code.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition"
              >
                Проверить код
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Обработка...</p>
            </div>
          )}

          {status === 'verified' && sessionData && (
            <div className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-500">Заведение</p>
                <p className="font-bold text-gray-900">{sessionData.business.name}</p>
                <div className="mt-2 flex justify-between items-center border-t border-blue-200 pt-2">
                  <span className="text-sm text-gray-500">Скидка гостю:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {sessionData.offer.customerDiscountPercent || 0}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сумма чека (до скидки)</label>
                <input 
                  type="number" 
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-right text-2xl p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition"
                  placeholder="0"
                />
              </div>

              {Number(billAmount) > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Сумма:</span>
                    <span>{Number(billAmount).toLocaleString()} IDR</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Скидка ({(sessionData.offer.customerDiscountPercent || 0)}%):</span>
                    <span>- {calculateDiscount().toLocaleString()} IDR</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>К оплате:</span>
                    <span>{calculateTotal().toLocaleString()} IDR</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => { setStatus('idle'); setCode(''); setBillAmount(''); }}
                  className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={!billAmount || Number(billAmount) <= 0}
                  className="w-2/3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 rounded-xl transition"
                >
                  Оплата получена
                </button>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Успешно!</h2>
              <p className="text-gray-500">Скидка применена, вознаграждение партнеру зачислено.</p>
              <button 
                onClick={() => { setStatus('idle'); setCode(''); setBillAmount(''); }}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
              >
                Новый чек
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
