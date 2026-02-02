
# Cafe W Fen - Hệ Thống Quản Lý Chuỗi Cửa Hàng Cà Phê

## Giới Thiệu
Cafe W Fen là nền tảng quản lý tập trung được thiết kế cho chuỗi cửa hàng cà phê. Hệ thống tối ưu hóa các hoạt động kinh doanh tại từng chi nhánh đồng thời cung cấp khả năng giám sát toàn diện cho toàn bộ chuỗi. Bao gồm quản lý sản phẩm, đơn hàng, kho, phân quyền người dùng, theo dõi doanh thu và thống kê lợi nhuận, đảm bảo tính chính xác, linh hoạt và khoa học.

## 🎥 Video Demo

[![Cafe W Fen - Demo Hệ Thống](https://img.youtube.com/vi/qu47eApz-_w/maxresdefault.jpg)](https://www.youtube.com/watch?v=qu47eApz-_w)

**[▶️ Xem video demo đầy đủ](https://www.youtube.com/watch?v=qu47eApz-_w)**

## Tính Năng Chính

### 🏪 Quản Lý Đa Chi Nhánh
- **Quản lý chi nhánh:** Thêm, sửa, xóa thông tin chi nhánh (địa chỉ, số điện thoại, trạng thái hoạt động)
- **Phân quyền theo chi nhánh:** Mỗi Manager chỉ quản lý chi nhánh được phân công
- **Giỏ hàng theo chi nhánh:** Khách hàng chỉ có thể đặt sản phẩm từ 1 chi nhánh trong 1 đơn hàng
- **Thống kê theo chi nhánh:** Doanh thu, đơn hàng, sản phẩm bán chạy theo từng chi nhánh

### 👥 Quản Lý Phân Quyền
- **Admin:** Quản lý toàn hệ thống (tất cả chi nhánh, nhân viên, sản phẩm, nguyên liệu, đơn hàng, khách hàng, khuyến mãi)
- **Manager:** Quản lý 1 chi nhánh cụ thể (nhân viên chi nhánh, kho chi nhánh, đơn hàng chi nhánh, thống kê chi nhánh, bàn)
- **Staff:** Thu ngân tại quầy (nhận đơn, quản lý bàn, cập nhật trạng thái đơn hàng)
- **Customer:** Mua sắm, đặt hàng online, theo dõi đơn hàng, đánh giá sản phẩm

### 🛍️ Quản Lý Sản Phẩm & Menu
- **Danh mục sản phẩm:** Cà phê, Trà sữa, Trà trái cây, Nước ép, Sinh tố, Bánh ngọt
- **Size linh hoạt:** S, M, L cho đồ uống; piece/whole cho bánh
- **Nhiệt độ:** Nóng/Lạnh cho từng sản phẩm
- **Sản phẩm nổi bật:** Đánh dấu sản phẩm mới, phổ biến, best seller
- **Lọc sản phẩm:** Theo chi nhánh, danh mục, giá, nhiệt độ
- **Rating & Review:** Khách hàng đánh giá sau khi hoàn thành đơn hàng

### 🎁 Khuyến Mãi & Mã Giảm Giá
- **Quản lý coupon:** Tạo, sửa, xóa mã giảm giá theo chi nhánh
- **Loại giảm giá:** Phần trăm hoặc số tiền cố định
- **Trạng thái coupon:** Có hiệu lực, Hết hạn, Ngừng áp dụng
- **Ưu đãi thành viên:** Giảm giá tự động theo hạng khách hàng (Bronze 3%, Silver 5%, Gold 7%)
- **Xung đột khuyến mãi:** Modal cảnh báo khi áp coupon có thể làm mất ưu đãi thành viên

### 📦 Quản Lý Đơn Hàng
- **Đặt hàng online:** Khách hàng tự đặt qua website
- **Đặt hàng tại quầy:** Staff hỗ trợ đặt cho khách (chọn bàn trước)
- **Trạng thái đơn:** Nháp → Chờ xác nhận → Đang xử lý → Hoàn thành / Đã hủy
- **Phương thức thanh toán:** Tiền mặt, VNPay (QR/Banking)
- **Phương thức giao hàng:** Giao tận nơi, Nhận tại cửa hàng
- **Tracking:** Theo dõi trạng thái đơn hàng real-time
- **In hóa đơn:** Tự động generate PDF cho đơn hàng

### 📊 Thống Kê & Báo Cáo
- **Doanh thu:** Theo ngày, 14 ngày, 30 ngày (biểu đồ line chart)
- **Top sản phẩm:** 5 sản phẩm bán chạy nhất
- **Top chi nhánh:** Xếp hạng chi nhánh theo doanh thu
- **Phân loại đơn:** Online vs Tại chỗ (pie chart)
- **Xu hướng:** Biểu đồ đơn hàng và doanh thu theo thời gian
- **Hạng khách hàng:** Phân bố Bronze/Silver/Gold

### 🎨 Giao Diện & Trải Nghiệm
- **Responsive:** Tối ưu cho desktop, tablet, mobile
- **Dark/Light mode:** Tùy chỉnh giao diện (WIP)
- **Toast notifications:** Thông báo realtime cho các hành động
- **Loading states:** UX mượt mà với skeleton loading
- **Debounce optimization:** Giảm số lượng API calls khi update giỏ hàng
- **Optimistic updates:** UI phản hồi ngay lập tức

## Phạm Vi Hệ Thống
- Kiến trúc đa chi nhánh, đa vai trò
- Vận hành độc lập từng chi nhánh với báo cáo tập trung
- Phân quyền linh hoạt và tách biệt dữ liệu
- Hỗ trợ Admin, Manager, Staff, và Customer

## Vai Trò Người Dùng

### 👑 Admin (Chủ chuỗi cửa hàng)
**Quyền hạn:** Quản lý toàn bộ hệ thống
- ✅ Quản lý tất cả chi nhánh (CRUD)
- ✅ Quản lý nhân viên toàn hệ thống (phân quyền, phân chi nhánh)
- ✅ Quản lý sản phẩm toàn hệ thống (thêm/sửa/xóa, đánh dấu best seller/mới)
- ✅ Quản lý nguyên liệu và kho toàn hệ thống
- ✅ Quản lý đơn hàng tất cả chi nhánh
- ✅ Quản lý khuyến mãi/coupon toàn hệ thống
- ✅ Xem thống kê tổng hợp toàn chuỗi (doanh thu, top sản phẩm, top chi nhánh)
- ✅ Quản lý khách hàng và hạng thành viên
- ✅ Xem đánh giá sản phẩm từ tất cả chi nhánh

### 🏢 Manager (Quản lý chi nhánh)
**Quyền hạn:** Quản lý 1 chi nhánh được phân công
- ✅ Quản lý nhân viên chi nhánh (CRUD)
- ✅ Quản lý sản phẩm chi nhánh (chỉ xem, không thêm/sửa/xóa)
- ✅ Quản lý kho nguyên liệu chi nhánh
- ✅ Quản lý đơn hàng chi nhánh (xác nhận, cập nhật trạng thái)
- ✅ Quản lý khuyến mãi/coupon chi nhánh
- ✅ Quản lý bàn (trạng thái bàn, gán đơn hàng)
- ✅ Xem thống kê chi nhánh (doanh thu, đơn hàng, top sản phẩm)
- ✅ Xem đánh giá sản phẩm từ đơn hàng chi nhánh
- ❌ Không thể xem dữ liệu chi nhánh khác

### 💼 Staff (Nhân viên thu ngân)
**Quyền hạn:** Hỗ trợ khách hàng tại quầy
- ✅ Nhận đơn hàng tại quầy (chọn bàn → thêm sản phẩm → thanh toán)
- ✅ Xem và quản lý đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Quản lý thông tin khách hàng
- ✅ Xem danh sách nhân viên chi nhánh
- ❌ Không có quyền thống kê, quản lý kho, quản lý sản phẩm

### 🛒 Customer (Khách hàng)
**Quyền hạn:** Mua sắm và quản lý tài khoản
- ✅ Xem menu sản phẩm (không cần đăng nhập)
- ✅ Lọc sản phẩm theo chi nhánh, danh mục, giá, nhiệt độ
- ✅ Thêm vào giỏ hàng (cần đăng nhập)
- ✅ Đặt hàng online (giao hàng hoặc nhận tại cửa hàng)
- ✅ Thanh toán (tiền mặt, VNPay)
- ✅ Áp dụng mã giảm giá
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Đánh giá sản phẩm (sau khi hoàn thành đơn)
- ✅ Quản lý thông tin cá nhân
- ✅ Tích lũy điểm và nâng hạng (Bronze → Silver → Gold)

---

## 💳 Tích Hợp Thanh Toán VNPay

Hệ thống tích hợp **VNPay Sandbox** để xử lý thanh toán online an toàn và nhanh chóng.

### Flow Thanh Toán

**1️⃣ Khởi tạo thanh toán (Frontend → Backend)**
```typescript
POST /payment/vnpay/create
{
  orderId: 123,
  amount: 465000,
  orderInfo: "Thanh toan don hang 123",
  returnUrl: "https://se-347-coffee-chain-system.vercel.app/vnpay-callback"
}
```

**2️⃣ Tạo VNPay Payment URL (Backend)**
- Backend sử dụng `vnpay` package để tạo URL thanh toán
- Tham số: `vnp_TmnCode`, `vnp_Amount`, `vnp_TxnRef`, `vnp_ReturnUrl`
- Tạo chữ ký `vnp_SecureHash` với SHA512
- Trả về: `{ paymentUrl: "https://sandbox.vnpayment.vn/..." }`

**3️⃣ Redirect đến VNPay (Frontend)**
```typescript
window.location.href = paymentData.paymentUrl;
```

**4️⃣ Khách hàng thanh toán trên VNPay**
- Chọn ngân hàng (ATM/Internet Banking/QR Code)
- Nhập thông tin thẻ và OTP
- VNPay xử lý giao dịch

**5️⃣ VNPay redirect về Frontend**
```
https://se-347-coffee-chain-system.vercel.app/vnpay-callback?
  vnp_Amount=46500000&
  vnp_BankCode=NCB&
  vnp_ResponseCode=00&
  vnp_SecureHash=abc123...&
  vnp_TxnRef=123&
  ...
```

**6️⃣ Frontend xác thực với Backend**
```typescript
GET /payment/vnpay/callback?vnp_Amount=...&vnp_SecureHash=...
```

**7️⃣ Backend verify signature & update order**
- Xác thực `vnp_SecureHash` với secret key
- Kiểm tra `vnp_ResponseCode === '00'` (thành công)
- Lưu transaction vào database
- Cập nhật order: `paymentStatus = "Đã thanh toán"`, `status = "Chờ xác nhận"`
- Trả về: `{ isSuccess: true, message: "Thanh toán thành công", orderId }`

**8️⃣ Frontend hiển thị kết quả**
- ✅ Thành công: Redirect đến trang tracking order
- ❌ Thất bại: Hiển thị lỗi, đơn hàng lưu ở trạng thái "Nháp"

### Mã Lỗi VNPay

| Mã | Ý nghĩa |
|-----|----------|
| `00` | Giao dịch thành công |
| `24` | Khách hàng hủy giao dịch |
| `51` | Tài khoản không đủ số dư |
| `65` | Vượt quá hạn mức giao dịch trong ngày |
| `75` | Ngân hàng đang bảo trì |

### Bảo Mật

- **Chữ ký SHA512:** Đảm bảo tính toàn vẹn dữ liệu
- **Return URL:** Trỏ về frontend, backend verify signature
- **Transaction log:** Lưu đầy đủ để đối soát

---

## Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) >= 16.x (khuyến nghị 18.x)
- [Yarn](https://yarnpkg.com/) >= 1.22.x

## Cài Đặt

### 1. Clone Repository
```bash
git clone https://github.com/junkyedh/SE347-Coffee-Chain-System.git
cd SE347-web
```

### 2. Cài Đặt Dependencies
```bash
yarn install
```

### 3. Cấu Hình Environment Variables

#### Development (Local)
Tạo file `.env.local` (file này sẽ không được commit):
```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local` với cấu hình local:
```env
# Backend API (local)
REACT_APP_API_URL=http://localhost:3000

# Frontend URL (local)
REACT_APP_BASE_URL=http://localhost:3001

# VNPay Return URL (local)
REACT_APP_VNPAY_RETURN_URL=http://localhost:3001/vnpay-callback

# VNPay Credentials (sandbox)
REACT_APP_VNPAY_TMN_CODE=your_tmn_code
REACT_APP_VNPAY_HASH_SECRET=your_hash_secret
```

#### Production (Deploy)
File `.env` chứa cấu hình production (có thể commit):
```env
# Backend API (production)
REACT_APP_API_URL=https://cafe-w-fen-be-production.up.railway.app

# VNPay Return URL (production)
REACT_APP_VNPAY_RETURN_URL=https://se-347-coffee-chain-system.vercel.app/vnpay-callback
```

**Lưu ý:** 
- File `.env.local` sẽ override `.env` khi chạy local
- Không commit `.env.local` (đã có trong `.gitignore`)
- Thông tin VNPay cần đăng ký tại [sandbox.vnpayment.vn](https://sandbox.vnpayment.vn)

#### 🧪 Thông Tin Test VNPay Sandbox

Sau khi đăng ký tài khoản VNPay Sandbox, bạn sẽ nhận được:

**Thông tin cấu hình:**
```env
REACT_APP_VNPAY_TMN_CODE=3CEHDS0A
REACT_APP_VNPAY_HASH_SECRET=JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G
REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

**Thẻ test để thanh toán:**
| Thông tin | Giá trị |
|-----------|---------|
| **Ngân hàng** | NCB |
| **Số thẻ** | 9704198526191432198 |
| **Tên chủ thẻ** | NGUYEN VAN A |
| **Ngày phát hành** | 07/15 |
| **Mật khẩu OTP** | 123456 |

**Merchant Admin (quản lý giao dịch):**
- URL: https://sandbox.vnpayment.vn/merchantv2/
- Tài liệu: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- Demo: https://sandbox.vnpayment.vn/apis/vnpay-demo/

## Chạy Ứng Dụng

### Chế Độ Development
```bash
yarn start
```
Ứng dụng sẽ chạy tại [http://localhost:3001](http://localhost:3001)

**Hot reload:** Code thay đổi sẽ tự động reload

### Build Production
```bash
yarn build
```
Tạo production build trong thư mục `build/`

**Kiểm tra build:**
```bash
# Cài serve nếu chưa có
npm install -g serve

# Chạy build locally
serve -s build -l 3001
```

### Chạy Tests
```bash
yarn test
```

## Project Structure
```
SE347-web/
├── public/              # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── admin/      # Admin-specific components
│   │   ├── common/     # Shared components
│   │   └── customer/   # Customer-facing components
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   └── customer/   # Customer pages
│   ├── routes/         # Route configuration
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   └── utils/          # Utility functions
├── .env.example        # Environment variables template
└── package.json        # Project dependencies
```

## Available Scripts

- **`yarn start`** - Runs the app in development mode
- **`yarn build`** - Builds the app for production
- **`yarn test`** - Launches the test runner
- **`yarn eject`** - Ejects from Create React App (one-way operation)

## Deploy Lên Production

### Chuẩn Bị
1. **Cập nhật file `.env`** với cấu hình production
2. **Build project:**
   ```bash
   yarn build
   ```
3. Thư mục `build/` chứa các file đã được optimize

### Deploy lên Vercel

**Bước 1: Push code lên GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Bước 2: Deploy qua Vercel Dashboard**
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập
2. Click **"New Project"**
3. Import repository từ GitHub
4. Cấu hình project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (hoặc `SE347-web` nếu monorepo)
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`
5. Thêm **Environment Variables** (Settings → Environment Variables):
   ```
   REACT_APP_API_URL=https://cafe-w-fen-be-production.up.railway.app
   REACT_APP_VNPAY_TMN_CODE=3CEHDS0A
   REACT_APP_VNPAY_HASH_SECRET=JMQ53A9CM6XTGRPHIBU1CJ4HJFTC1J2G
   REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   REACT_APP_VNPAY_RETURN_URL=https://your-app.vercel.app/vnpay-callback
   REACT_APP_ENVIRONMENT=production
   REACT_APP_API_TIMEOUT=60000
   ```
6. Click **"Deploy"**

**Bước 3: Cập nhật VNPAY_RETURN_URL**
- Sau khi deploy xong, copy domain từ Vercel (vd: `https://se-347-coffee-chain-system.vercel.app`)
- Vào Settings → Environment Variables
- Cập nhật `REACT_APP_VNPAY_RETURN_URL` với domain thực tế
- Redeploy project

**Auto Deploy:**
- Vercel tự động deploy khi push code lên branch `main`
- Preview deploy cho các pull request

## Environment Variables

The following environment variables are supported:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:5000/api` |
| `REACT_APP_BASE_URL` | Frontend base URL | `http://localhost:3000` |
| `REACT_APP_VNPAY_URL` | VNPay payment gateway URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `REACT_APP_VNPAY_RETURN_URL` | VNPay callback URL | `http://localhost:3000/vnpay-callback` |
| `REACT_APP_ENVIRONMENT` | Environment mode | `development` or `production` |

## How to Contribute
1. Fork this repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request.

## Acknowledgements
- Inspired by real-world coffee chain management needs.
- Thanks to all contributors and open-source libraries used in this project.

## License
This project is licensed under the [MIT License](LICENSE).

