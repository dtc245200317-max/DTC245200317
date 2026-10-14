# Hệ thống Quản lý Phòng Gym / Fitness

**Sinh viên thực hiện:** Poòng Văn Hoa  
**Mã số SV:** DTC245200317

---

## 1. Giới thiệu
Dự án triển khai một hệ thống quản lý phòng Gym toàn diện chạy trên nền tảng Docker, bao gồm Nginx Reverse Proxy, MySQL, phpMyAdmin, hệ thống giám sát (Prometheus & Grafana) và quản lý log tập trung (Loki & Promtail).

## 2. Các thành phần hệ thống
* **Frontend Network:** Nginx, Grafana.
* **Backend Network:** MySQL, phpMyAdmin, Prometheus, Loki, Promtail.
* **Biện pháp bảo mật (Hardening):** Phân lập mạng lưới, chạy container bằng quyền non-root, thiết lập Security Headers.

## 3. Hướng dẫn chạy dự án
* Yêu cầu hệ thống đã cài đặt sẵn Docker và Docker Compose.
* Khởi động toàn bộ dịch vụ bằng lệnh:
* bash
docker compose up -d
### Thông tin truy cập:
* **Web Server (Nginx):** `http://<IP_Máy_Ảo>`
* **Quản lý Database (phpMyAdmin):** `http://<IP_Máy_Ảo>:8081`
* **Bảng điều khiển Grafana:** `http://<IP_Máy_Ảo>:3000` *(Tài khoản: admin / admin)*
