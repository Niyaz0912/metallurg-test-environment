import React, { useState, useEffect } from 'react';

type Props = {
  onRegisterSuccess: (token: string, role: string, departmentId: string) => void;
};

type Department = {
  id: number;
  name: string;
};

const RegisterForm: React.FC<Props> = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'employee',
    departmentId: '', // изначально пусто (строка!)
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Загрузка департаментов
  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/departments')
      .then((r) => r.json())
      .then(setDepartments)
      .catch((e) => setError('Ошибка загрузки департаментов'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'departmentId' && value !== ''
          ? Number(value) // Преобразуем в число!
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const res = await fetch('http://127.0.0.1:3001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Ошибка регистрации');

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      // Передаем данные в onRegisterSuccess
      onRegisterSuccess(data.token, data.role, data.departmentId);
    }, 1500);
  } catch (e: any) {
    setError(e.message || 'Ошибка регистрации');
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-2">Регистрация</h2>

      <input
        className="input"
        type="text"
        name="username"
        placeholder="Логин"
        required
        value={form.username}
        onChange={handleChange}
        autoComplete="username"
      />
      <input
        className="input"
        type="password"
        name="password"
        placeholder="Пароль"
        required
        value={form.password}
        onChange={handleChange}
        autoComplete="new-password"
      />
      <input
        className="input"
        type="text"
        name="firstName"
        placeholder="Имя"
        required
        value={form.firstName}
        onChange={handleChange}
      />
      <input
        className="input"
        type="text"
        name="lastName"
        placeholder="Фамилия"
        required
        value={form.lastName}
        onChange={handleChange}
      />

      <input
        className="input"
        type="tel"
        name="phone"
        placeholder="Телефон (+7XXXXXXXXXX)"
        pattern="^\+7\d{10}$"
        value={form.phone}
        onChange={handleChange}
        maxLength={12}
        title="Номер в формате +7XXXXXXXXXX (если указываете)"
        autoComplete="tel"
      />

      <select
        name="departmentId"
        value={form.departmentId}
        onChange={handleChange}
        className="input"
        required
      >
        <option value="">Выберите департамент</option>
        {departments.map(dep => (
          <option key={dep.id} value={dep.id}>
            {dep.name}
          </option>
        ))}
      </select>

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="input"
        required
      >
        <option value="employee">Сотрудник</option>
        <option value="master">Мастер</option>
        <option value="director">Директор</option>
        <option value="admin">Администратор</option>
      </select>

      <button
        type="submit"
        className="btn w-full"
        disabled={loading}
      >
        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">Регистрация успешна!</div>}
    </form>
  );
};

export default RegisterForm;
