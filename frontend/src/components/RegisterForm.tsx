import React, { useState } from 'react';

type Props = {
  onRegisterSuccess: () => void;
};

const RegisterForm: React.FC<Props> = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'employee', // по умолчанию "сотрудник" — первый вариант ENUM
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        onRegisterSuccess();
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
        type="text"
        name="phone"
        placeholder="Телефон"
        required
        value={form.phone}
        onChange={handleChange}
      />

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
