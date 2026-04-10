# MLZ Store - Dead by Daylight Gaming Store TODO

- [x] Dark theme with DbD-inspired red/black colors and global styling
- [x] Database schema (products, categories, orders, order_items, cart_items)
- [x] Homepage with hero section, featured products, DbD imagery
- [x] Navigation bar with logo, links, cart icon, user menu
- [x] Products listing page with search and category filters
- [x] Product detail page with images, description, price, add-to-cart
- [x] Shopping cart page with quantity controls and total calculation
- [x] Checkout flow with order creation
- [x] Order history page for users with order status tracking
- [x] Invoice/receipt generation for completed orders (PDF-ready InvoiceModal with print/download)
- [x] Admin dashboard with sales statistics
- [x] Admin products management (add, edit, delete products)
- [x] Admin orders management (view, change status)
- [x] Admin users management (view users, roles)
- [x] User profile page with personal info
- [x] Role-based access control (Admin/User) with protected routes
- [x] Discord Webhook notifications on new orders and status changes
- [x] Manual payment system (PayPal + Bank Transfer Al Rajhi)
- [x] Checkout page with payment method selection (PayPal / Bank Transfer)
- [x] Post-payment instructions page with order details and Discord ticket instructions
- [x] Discord notification with ticket creation prompt on new orders
- [x] Footer with store info and Discord server link
- [x] Mobile responsive design
- [x] Vitest tests for auth, admin access, cart, orders
- [x] Firebase Authentication integration with Google OAuth
- [x] FirebaseAuthContext for managing authentication state
- [x] Login page with Google Sign-In button
- [x] Protected routes - redirect unauthenticated users to login
- [x] Vitest tests for Firebase Authentication (10 tests passing)
- [x] Replaced Manus OAuth with Firebase Google OAuth

## مشاكل تم إصلاحها:
- [x] استبدال Manus OAuth بـ Firebase في backend بالكامل
- [x] إزالة جميع استدعاءات Manus OAuth من server/routers.ts
- [x] تحديث نظام المصادقة ليستخدم Firebase JWT tokens بدلاً من Manus
- [x] التأكد من أن جميع protected routes تعمل مع Firebase بدون إعادة توجيه لـ Manus
- [x] إضافة Firebase Admin SDK credentials
- [x] كتابة واختبار Vitest tests للمصادقة الجديدة
- [x] كتابة واختبار Vitest tests تكاملية (47 اختبار ناجح)
- [x] إزالة جميع استخدامات getLoginUrl من الصفحات
- [x] تحديث useAuth hook ليستخدم Firebase بدلاً من Manus
- [x] تحديث main.tsx لاستخدام /login بدلاً من getLoginUrl
- [x] تحديث Navbar.tsx لاستخدام Firebase بدلاً من Manus

## تحديثات جديدة - السماح بالتصفح بدون تسجيل دخول:
- [x] إزالة الحماية من الصفحة الرئيسية والمنتجات
- [x] السماح بتصفح المتجر بدون تسجيل دخول
- [x] إضافة Google Sign-In popup عند محاولة الشراء/إضافة للسلة
- [x] تحديث App.tsx لإزالة الحماية العامة
- [x] تحديث ProductDetail.tsx و Cart.tsx لاستخدام Google Sign-In popup
- [x] كتابة useGoogleSignIn hook
- [x] جميع 47 اختبار تمر بنجاح

## حذف Manus OAuth نهائياً:
- [x] حذف getLoginUrl من const.ts
- [x] تحديث DashboardLayout.tsx لاستخدام useGoogleSignIn بدلاً من getLoginUrl
- [x] تحديث useGoogleSignIn hook ليستخدم Firebase فقط
- [x] جميع 47 اختبار تمر بنجاح
- [x] لا توجد أخطاء TypeScript
