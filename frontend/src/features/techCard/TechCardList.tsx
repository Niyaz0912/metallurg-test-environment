import React, { useEffect, useState } from 'react';
import { fetchTechCards } from '../../shared/api/techCardsApi';

interface TechCard {
  id: number;
  productName: string;
  description?: string;
  drawingUrl?: string;
  specifications?: string;
  productionStages?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TechCardList: React.FC = () => {
  const [techCards, setTechCards] = useState<TechCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTechCards = async () => {
      try {
        const data = await fetchTechCards();
        setTechCards(data);
      } catch (err) {
        setError('Ошибка при загрузке технологических карт');
      } finally {
        setLoading(false);
      }
    };
    loadTechCards();
  }, []);

  if (loading) return <div>Загрузка технологических карт...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Технологические карты</h2>
      {techCards.length === 0 ? (
        <p>Технологические карты не найдены.</p>
      ) : (
        <ul>
          {techCards.map(tc => (
            <li key={tc.id}>
              <b>{tc.productName}</b><br />
              {tc.description && <p>{tc.description}</p>}
              {tc.drawingUrl && (
                <p>
                  Схема: <a href={tc.drawingUrl} target="_blank" rel="noreferrer">{tc.drawingUrl}</a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TechCardList;
