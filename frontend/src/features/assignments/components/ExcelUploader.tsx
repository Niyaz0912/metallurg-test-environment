// frontend/src/features/assignments/components/ExcelUploader.tsx
import React, { useState } from 'react';

interface UploadResult {
    summary: {
        total: number;
        created: number;
        errors: number;
        skipped: number;
    };
    details: {
        success: Array<{ row: number; operator: string; machine: string; assignmentId: number }>;
        errors: Array<{ row: number; error: string; data: Record<string, unknown> }>;
        skipped: Array<{ row: number; reason: string }>;
    };
}

interface ExcelUploaderProps {
    onUploadComplete: () => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const allowedExtensions = ['.xlsx', '.xls'];
            const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

            if (allowedExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                setError('');
                setResult(null);
            } else {
                setError('Выберите Excel файл (.xlsx или .xls)');
                e.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Выберите файл для загрузки');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('excelFile', file);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/assignments/upload-excel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
                onUploadComplete();

                // Очищаем выбранный файл
                setFile(null);
                const fileInput = document.getElementById('excel-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

            } else {
                const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
                setError(errorData.message || `Ошибка ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            setError('Ошибка соединения с сервером');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Массовая загрузка сменных заданий</h3>
                <p className="text-gray-600 mb-4">
                    Загрузите Excel файл с данными о сменных заданиях для автоматического создания заданий
                </p>

                {/* Выбор файла */}
                <div className="mb-4">
                    <input
                        id="excel-file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* Информация о выбранном файле */}
                {file && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                        <div className="text-sm text-blue-800">
                            <strong>Выбран файл:</strong> {file.name}
                        </div>
                        <div className="text-xs text-blue-600">
                            Размер: {(file.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                )}

                {/* Кнопка загрузки */}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-6 py-2 rounded font-medium ${!file || uploading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                >
                    {uploading ? 'Обработка файла...' : 'Загрузить задания'}
                </button>

                {/* Ошибки */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="text-red-800 text-sm">{error}</div>
                    </div>
                )}

                {/* Результаты загрузки */}
                {result && (
                    <div className="mt-6 text-left">
                        <h4 className="font-semibold mb-3">Результаты обработки:</h4>

                        {/* Сводка */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-blue-600">{result.summary.total}</div>
                                <div className="text-xs text-blue-800">Всего строк</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-green-600">{result.summary.created}</div>
                                <div className="text-xs text-green-800">Создано</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-red-600">{result.summary.errors}</div>
                                <div className="text-xs text-red-800">Ошибки</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded text-center">
                                <div className="text-2xl font-bold text-yellow-600">{result.summary.skipped}</div>
                                <div className="text-xs text-yellow-800">Пропущено</div>
                            </div>
                        </div>

                        {/* Успешно созданные */}
                        {result.details.success.length > 0 && (
                            <div className="mb-4">
                                <h5 className="font-medium text-green-800 mb-2">✅ Успешно созданы ({result.details.success.length}):</h5>
                                <div className="max-h-32 overflow-y-auto bg-green-50 p-2 rounded text-xs">
                                    {result.details.success.map((item, index) => (
                                        <div key={index} className="text-green-700">
                                            Строка {item.row}: {item.operator} → {item.machine} (ID: {item.assignmentId})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ошибки */}
                        {result.details.errors.length > 0 && (
                            <div className="mb-4">
                                <h5 className="font-medium text-red-800 mb-2">❌ Ошибки ({result.details.errors.length}):</h5>
                                <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded text-xs">
                                    {result.details.errors.map((item, index) => (
                                        <div key={index} className="text-red-700">
                                            Строка {item.row}: {item.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Инструкция по формату */}
                <div className="mt-6 text-left text-xs text-gray-600">
                    <h5 className="font-medium mb-2">📋 Формат Excel файла:</h5>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Заказчик</strong> - название компании-заказчика</li>
                        <li><strong>Наименование заказа</strong> - номер/код заказа</li>
                        <li><strong>Дата смены</strong> - дата в формате ГГГГ-ММ-ДД</li>
                        <li><strong>Тип смены</strong> - "день" или "ночь"</li>
                        <li><strong>Логин оператора</strong> - логин существующего пользователя</li>
                        <li><strong>Плановое количество</strong> - число деталей для обработки</li>
                        <li><strong>Номер станка</strong> - код/номер оборудования</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExcelUploader;

