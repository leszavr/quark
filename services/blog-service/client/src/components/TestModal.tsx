import { useState } from 'react';

interface TestModalProps {
  children: React.ReactNode;
}

export default function TestModal({ children }: TestModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <div onClick={openModal} style={{ cursor: 'pointer', display: 'inline-block' }}>
        {children}
      </div>
      
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'black'
              }}
            >
              ×
            </button>
            
            <h2 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
              Тестовое модальное окно
            </h2>
            
            <p style={{ color: 'black', fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
              Это простое модальное окно с черным текстом на белом фоне. 
              Если вы видите этот текст четко - значит, кастомные модальные окна работают правильно!
            </p>
            
            <form style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
                  Email:
                </label>
                <input 
                  type="email" 
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: 'black',
                    backgroundColor: 'white'
                  }}
                  placeholder="your@email.com"
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: 'black', marginBottom: '5px' }}>
                  Пароль:
                </label>
                <input 
                  type="password" 
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: 'black',
                    backgroundColor: 'white'
                  }}
                  placeholder="Введите пароль"
                />
              </div>
              
              <button
                type="button"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%'
                }}
                onClick={() => alert('Форма работает!')}
              >
                Войти (тест)
              </button>
            </form>
            
            <button
              onClick={closeModal}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}