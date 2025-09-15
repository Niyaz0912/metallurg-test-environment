import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import TechCardList from '../TechCardList';

// Mock API functions
vi.mock('../../../../shared/api/techCardsApi', () => ({
  getTechCardProgress: vi.fn(() => 50),
  isTechCardOverdue: vi.fn(() => false),
  getDaysToDeadline: vi.fn(() => 5),
  getPriorityColor: vi.fn(() => '#eab308')
}));

describe('TechCardList Component', () => {
  // Простые тестовые данные
  const mockTechCard = {
    id: 1,
    productName: 'Test Product',
    customer: 'Test Customer',
    order: 'Order-123',
    partNumber: 'PN-001',
    priority: 'medium' as const,
    quantity: 100,
    totalProducedQuantity: 50,
    status: 'active' as const,
    plannedEndDate: '2024-12-31',
    actualEndDate: undefined,
    pdfUrl: undefined,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const mockOnView = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render tech card', () => {
    render(
      <TechCardList 
        techCards={[mockTechCard]}
        onView={mockOnView}  // ← Используем onView везде
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
    expect(screen.getByText('Order-123')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(
      <TechCardList 
        techCards={[]} 
        onView={mockOnView} 
      />
    );
    
    expect(screen.getByText('Техкарты не найдены')).toBeInTheDocument();
  });

  it('should call onView when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TechCardList 
        techCards={[mockTechCard]}
        onView={mockOnView}
      />
    );

    const card = screen.getByText('Test Product').closest('[role="button"], div[class*="cursor-pointer"]');
    if (card) {
      await user.click(card);
      expect(mockOnView).toHaveBeenCalledWith(mockTechCard);  // ← Используем mockOnView
    }
  });
});