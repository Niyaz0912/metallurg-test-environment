import React, { useState } from 'react';
import { createProductionPlan } from '../../shared/api/productionPlansApi';

const ProductionPlanForm: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [orderName, setOrderName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [progressPercent, setProgressPercent] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!customerName || !orderName || quantity === '' || !deadline || progressPercent === '') {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await createProductionPlan({
        customerName,
        orderName,
        quantity: Number(quantity),
        deadline,
        progressPercent: Number(progressPercent),
      });
      setSuccess(true);
      setCustomerName('');
      setOrderName('');
      setQuantity('');
      setDeadline('');
      setProgressPercent('');
    } catch {
      setError('Ошибка при создании плана производства');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать новый план производства</h2>

      <div>
        <label>Заказчик:</label><br />
        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
      </div>

      <div>
        <label>Название заказа:</label><br />
        <input type="text" value={orderName} onChange={e => setOrderName(e.target.value)} required />
      </div>

      <div>
        <label>Количество:</label><br />
        <input 
          type="number" 
          value={quantity} 
          onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
          min={0}
        />
      </div>

      <div>
        <label>Дедлайн:</label><br />
        <input 
          type="date" 
          value={deadline} 
          onChange={e => setDeadline(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Прогресс (%):</label><br />
        <input 
          type="number" 
          value={progressPercent} 
          onChange={e => setProgressPercent(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
          min={0} max={100}
        />
      </div>

      <button type="submit">Создать</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>План успешно создан!</p>}
    </form>
  );
};

export default ProductionPlanForm;
