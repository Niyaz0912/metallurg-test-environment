const {VertexAI} = require('@google-cloud/vertexai');

// Настройки проекта
const project = 'metallurg-456520';
const location = 'us-central1';

// Инициализация Vertex AI
const vertexAI = new VertexAI({
  project: project, 
  location: location
});

async function testGemini() {
  try {
    // Создание экземпляра модели
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    // Тестовый запрос
    const prompt = 'Привет! Как дела?';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('Ответ от Gemini:', response.text());
  } catch (error) {
    console.error('Ошибка при подключении к Gemini:', error.message);
  }
}

testGemini();
