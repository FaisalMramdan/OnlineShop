# 📘 User Guide — StepZone Online Shop

> **Versi Aplikasi:** 1.0.0  
> **Backend:** Go (Gin Framework) — Port 8080  
> **Frontend:** React + Vite (TailwindCSS) — Port 5173  
> **Tanggal:** April 2026

---

## Daftar Isi

1. [Cara Registrasi Akun](#1-cara-registrasi-akun)
2. [Cara Login](#2-cara-login)
3. [Halaman Utama (Home)](#3-halaman-utama-home)
4. [Cara Belanja & Menambah ke Keranjang](#4-cara-belanja--menambah-ke-keranjang)
5. [Cara Checkout & Pembayaran](#5-cara-checkout--pembayaran)
6. [Fitur Admin](#6-fitur-admin)
   - [Dashboard Admin](#61-dashboard-admin)
   - [Manajemen Produk](#62-manajemen-produk)
   - [Manajemen Kategori](#63-manajemen-kategori)
   - [Manajemen Pesanan](#64-manajemen-pesanan)

---

## 1. Cara Registrasi Akun

Sebelum dapat berbelanja, pengguna baru harus membuat akun terlebih dahulu.

**Langkah-langkah:**

1. Buka browser dan akses: `http://localhost:5173/register`
2. Isi formulir registrasi:
   - **Nama Lengkap** — Masukkan nama pengguna
   - **Email** — Masukkan alamat email yang valid
   - **Password** — Masukkan password minimal 6 karakter
3. Klik tombol **"Daftar Sekarang"**
4. Jika berhasil, sistem akan mengarahkan ke halaman Login

> **Catatan:** Setiap email hanya dapat didaftarkan satu kali. Jika email sudah terdaftar, akan muncul pesan kesalahan.

![Halaman Register](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/register_page_1775807154188.png)
*Tampilan halaman Registrasi Akun*

---

## 2. Cara Login

Setelah memiliki akun, pengguna dapat login untuk mengakses fitur belanja.

**Langkah-langkah:**

1. Akses halaman: `http://localhost:5173/login`
2. Masukkan **Email** dan **Password** yang sudah didaftarkan
3. Klik tombol **"Masuk"**
4. Sistem akan:
   - Memvalidasi kredensial di server
   - Menghasilkan **JWT Token** yang disimpan di `localStorage`
   - Mengarahkan ke halaman utama (jika role = `user`)
   - Mengarahkan ke halaman Admin (jika role = `admin`)

> **Pesan Kesalahan:** Jika email atau password salah, akan muncul notifikasi "Email atau password salah".

![Halaman Login](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/login_page_1775807148833.png)
*Tampilan halaman Login*

### Perbedaan Role Pengguna

| Role    | Akses Halaman                          |
|---------|----------------------------------------|
| `user`  | Home, Cart, Checkout, Pembayaran       |
| `admin` | Dashboard Admin, Produk, Kategori, Pesanan |

---

## 3. Halaman Utama (Home)

Halaman utama menampilkan seluruh katalog produk yang tersedia.

**Fitur di Halaman Utama:**

- **Navbar** — Logo StepZone, link Katalog, Keranjang, dan Pesanan Saya
- **Search Bar** — Cari produk berdasarkan nama
- **Filter Kategori** — Filter produk berdasarkan kategori (Semua / kategori spesifik)
- **Grid Produk** — Menampilkan kartu produk berisi:
  - Gambar produk
  - Nama produk
  - Harga (Rp)
  - Stok tersedia
  - Tombol **"Tambah ke Keranjang"**
- **Profil Dropdown** — Klik ikon profil untuk melihat nama pengguna dan tombol Logout

![Halaman Home](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/home_page_1775807143639.png)
*Tampilan Halaman Utama — Katalog Produk*

---

## 4. Cara Belanja & Menambah ke Keranjang

**Langkah-langkah menambah produk ke keranjang:**

1. Pastikan sudah **Login**
2. Di halaman utama, temukan produk yang diinginkan
3. Gunakan **Search Bar** untuk mencari produk tertentu
4. Gunakan **Filter Kategori** untuk menyaring berdasarkan jenis produk
5. Klik tombol **"Tambah ke Keranjang"** pada produk yang dipilih
6. Produk otomatis ditambahkan ke keranjang belanja

**Melihat dan Mengelola Keranjang:**

1. Klik ikon keranjang atau menu **"Keranjang"** di Navbar
2. Halaman keranjang (`/cart`) menampilkan:
   - Daftar produk yang dipilih
   - Gambar, nama, harga, dan jumlah setiap produk
   - Tombol `+` / `-` untuk mengubah jumlah
   - Tombol hapus (🗑️) untuk menghapus item
   - **Total harga keseluruhan**
3. Klik **"Checkout Sekarang"** untuk melanjutkan ke pembayaran

![Halaman Keranjang](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/cart_page_empty_1775807165155.png)
*Tampilan Halaman Keranjang Belanja*

---

## 5. Cara Checkout & Pembayaran

**Alur Checkout:**

1. Di halaman keranjang, klik tombol **"Checkout Sekarang"**
2. Sistem akan memproses seluruh item di keranjang
3. Order baru dibuat di database dengan status `pending`
4. Keranjang akan otomatis **dikosongkan** setelah checkout berhasil
5. Sistem menampilkan `order_id` dan total harga

**Alur Pembayaran (Xendit):**

1. Setelah checkout, klik tombol **"Bayar Sekarang"** atau navigasi ke `/user/pay/:order_id`
2. Sistem akan membuat **Invoice Xendit** secara otomatis
3. URL pembayaran akan dikirimkan ke pengguna
4. Pengguna diarahkan ke **Halaman Pembayaran Xendit** dan dapat memilih metode:
   - Transfer Bank (BCA, Mandiri, BNI, BRI, dll.)
   - Virtual Account
   - E-Wallet (OVO, DANA, GoPay, dll.)
   - Kartu Kredit/Debit
5. Setelah pembayaran selesai, Xendit mengirimkan notifikasi ke **webhook** sistem
6. Status order otomatis berubah menjadi `paid`

**Status Pesanan:**

| Status    | Keterangan                                  |
|-----------|---------------------------------------------|
| `pending` | Order dibuat, menunggu pembayaran            |
| `paid`    | Pembayaran diterima melalui webhook Xendit   |
| `process` | Pesanan sedang diproses oleh admin           |
| `shipped` | Pesanan telah dikirim                        |
| `done`    | Pesanan selesai                              |

---

## 6. Fitur Admin

Pengguna dengan role `admin` dapat mengakses panel administrasi di `/admin`.

### 6.1 Dashboard Admin

Halaman pertama setelah login sebagai admin.

**Informasi yang ditampilkan:**
- **Total Produk** — Jumlah produk yang terdaftar
- **Total Kategori** — Jumlah kategori aktif
- **Total Pesanan** — Jumlah semua order masuk
- **Total Revenue** — Total pendapatan dari order berstatus `paid`
- **Grafik Order** — Statistik pesanan berdasarkan status (Pending, Paid, dsb)

![Admin Dashboard](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/admin_dashboard_1775807177418.png)
*Tampilan Admin Dashboard*

---

### 6.2 Manajemen Produk

Akses: **Sidebar → Produk** (`/admin/produk`)

**Fitur:**

| Aksi           | Cara                                                           |
|----------------|----------------------------------------------------------------|
| Lihat Produk   | Tabel menampilkan ID, Gambar, Nama, Kategori, Harga, Stok     |
| Cari Produk    | Gunakan kolom pencarian di atas tabel                         |
| Tambah Produk  | Klik tombol **"Tambah Produk"**, isi formulir lalu simpan     |
| Edit Produk    | Klik ikon ✏️ di baris produk, ubah data, klik simpan         |
| Hapus Produk   | Klik ikon 🗑️ di baris produk, konfirmasi penghapusan         |

**Formulir Tambah/Edit Produk:**
- Nama Produk
- Kategori (dropdown)
- Harga (Rp)
- Stok
- Deskripsi
- Gambar (Upload file)

![Admin Produk](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/admin_products_1775807184721.png)
*Tampilan Halaman Manajemen Produk*

---

### 6.3 Manajemen Kategori

Akses: **Sidebar → Kategori** (`/admin/kategori`)

**Fitur:**

| Aksi             | Cara                                                        |
|------------------|-------------------------------------------------------------|
| Lihat Kategori   | Tabel menampilkan ID, Nama, dan Ikon kategori               |
| Tambah Kategori  | Klik **"Tambah Kategori"**, isi nama dan ikon, lalu simpan  |
| Edit Kategori    | Klik ikon ✏️ pada baris kategori, ubah data, simpan        |
| Hapus Kategori   | Klik ikon 🗑️ pada baris kategori, konfirmasi               |

![Admin Kategori](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/admin_categories_empty_1775807191534.png)
*Tampilan Halaman Manajemen Kategori*

---

### 6.4 Manajemen Pesanan

Akses: **Sidebar → Pesanan** (`/admin/pesanan`)

**Fitur:**

| Aksi              | Cara                                                              |
|-------------------|-------------------------------------------------------------------|
| Lihat Semua Order | Tabel menampilkan ID, Customer, Tanggal, Total, Status            |
| Filter by Status  | Klik kartu status: Pending / Diproses / Dikirim / Selesai         |
| Detail Order      | Klik pada baris pesanan untuk melihat detail item                 |
| Update Status     | Pilih status baru di dropdown, klik simpan                        |

**Alur Update Status Pesanan:**
```
pending → paid (otomatis via Xendit) → process → shipped → done
```

![Admin Pesanan](/C:/Users/MyBook Hype AMD/.gemini/antigravity/brain/29bbba0e-c8e3-49bb-9f83-39bcae8f58a3/admin_orders_empty_1775807198895.png)
*Tampilan Halaman Manajemen Pesanan*

---

## ℹ️ Informasi Teknis Singkat

| Komponen   | Teknologi           | Alamat                  |
|------------|---------------------|-------------------------|
| Backend    | Go + Gin Framework  | http://localhost:8080   |
| Frontend   | React 19 + Vite 8   | http://localhost:5173   |
| Database   | MySQL               | localhost:3306          |
| Payment    | Xendit Invoice API  | https://xendit.co       |

---

*Dokumen ini dibuat untuk keperluan UJIKOM — StepZone Online Shop © 2026*
