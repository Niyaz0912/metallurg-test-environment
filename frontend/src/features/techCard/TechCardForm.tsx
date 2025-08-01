import React, { useState } from 'react';
import { createTechCard } from '../../shared/api/techCardsApi';

const TechCardForm: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [productionStages, setProductionStages] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!productName) {
      setError('Название продукта обязательно');
      return;
    }

    try {
      await createTechCard({
        productName,
        description,
        drawingUrl,
        specifications,
        productionStages,
      });
      setSuccess(true);
      // Очистка формы
      setProductName('');
      setDescription('');
      setDrawingUrl('');
      setSpecifications('');
      setProductionStages('');
    } catch {
      setError('Ошибка при создании технологической карты');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать технологическую карту</h2>

      <div>
        <label>Название продукта:</label><br />
        <input 
          type="text" 
          value={productName} 
          onChange={e => setProductName(e.target.value)} 
          required 
          maxLength={255}
        />
      </div>

      <div>
        <label>Описание:</label><br />
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={3} 
          maxLength={1000}
        />
      </div>

      <div>
        <label>Ссылка на чертёж:</label><br />
        <input 
          type="url" 
          value={drawingUrl} 
          onChange={e => setDrawingUrl(e.target.value)} 
          placeholder="http://example.com/drawing.pdf"
        />
      </div>

      <div>
        <label>Спецификации:</label><br />
        <textarea 
          value={specifications} 
          onChange={e => setSpecifications(e.target.value)} 
          rows={3} 
        />
      </div>

      <div>
        <label>Этапы производства:</label><br />
        <textarea 
          value={productionStages} 
          onChange={e => setProductionStages(e.target.value)} 
          rows={4} 
        />
      </div>

      <button type="submit">Создать</button>

      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>Технологическая карта успешно создана!</p>}
    </form>
  );
};

export default TechCardForm;
