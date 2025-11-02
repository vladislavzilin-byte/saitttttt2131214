IZ HAIR TREND – ACCOUNT + HEADER PACK
-------------------------------------

Это готовый пакет, чтобы встроить:
- Регистрация / Логин (с Instagram и телефоном)
- Сессия пользователя через localStorage
- Обновлённый Shop с customer_hint для backend
- Кнопка Login / Profile / Logout в левом верхнем углу хедера
- Языковое меню справа, как у тебя было

Файлы в пакете
--------------
src/context/AuthContext.tsx
src/components/AccountMenu.tsx
src/components/Header.tsx
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/Shop.tsx
README.txt (этот файл)

Шаг 1. Положи файлы в свой проект
---------------------------------
Скопируй эти файлы в свой Vite-проект (перезапиши Shop.tsx).
Если у тебя уже есть своя src/context/AuthContext.tsx или Shop.tsx — замени их этими версиями.

Шаг 2. Оберни всё приложение в AuthProvider
-------------------------------------------
В main.tsx сделай так (пример):

  import { AuthProvider } from './context/AuthContext'
  import { BrowserRouter } from 'react-router-dom'
  import App from './App'
  import './index.css'

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  )

Важно: AuthProvider ДОЛЖЕН быть выше всего, чтобы AccountMenu и Shop видели user.

Шаг 3. Добавь маршруты /login и /register
-----------------------------------------
В твоих <Routes> добавь:

  import Login from './pages/Login'
  import Register from './pages/Register'

  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

Shop, Success, Cancel и т.д. оставь как есть.

Шаг 4. Подключи хедер с меню логина и языком
-------------------------------------------
Импортируй Header и отрендери его в твоём layout (обычно в твоей главной странице или общем Layout-компоненте):

  import Header from './components/Header'

  function HomePage() {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <Header />

        ...твой контент hero, кнопки Portfolio / Training / Shop / Contacts...
      </div>
    )
  }

Header сам рендерит:
- слева: <AccountMenu /> (Login / Profile dropdown)
- справа: твой language switcher (сейчас заглушка EN/LT — замени своей логикой)

Шаг 5. Что увидит клиент
------------------------
1. Не залогинен → в левом верхнем углу будет стеклянная таблетка "Login".
   Клик ведёт на /login.

2. Зарегистрировался → в левом верхнем углу теперь "Hi, {name}" с зелёной точкой.
   Клик открывает выпадающее меню:
   - My cart / Shop
   - Account / Login page
   - Logout

3. В Shop при нажатии Stripe/PayPal мы теперь отправляем на backend не только корзину,
   но и:
   name / email / instagram / phone
   Это попадёт в customer_hint, и в письме мастеру ты будешь видеть контакт клиента.

Шаг 6. Backend
--------------
Твой server.js уже должен принимать POST /api/checkout/stripe и /api/checkout/paypal
и читать customer_hint. Если ты используешь мой server.js из предыдущего архива,
ничего менять не нужно.

Готово. После этого у тебя:
- старый визуальный hero / layout
- меню языка справа вверху
- меню аккаунта слева вверху
- авторизация с insta/телефоном
- бэк получает контактные данные клиента
