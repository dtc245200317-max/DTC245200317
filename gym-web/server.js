const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'db', user: 'root', password: 'StrongPassword!@#2026', database: 'gym_management', multipleStatements: true
});
db.connect(err => { if (err) console.error(err); else console.log('Đã kết nối MySQL!'); });

const initDB = `
  CREATE TABLE IF NOT EXISTS hoi_vien (id INT AUTO_INCREMENT PRIMARY KEY, ten VARCHAR(100), sdt VARCHAR(15));
  CREATE TABLE IF NOT EXISTS goi_tap (id INT AUTO_INCREMENT PRIMARY KEY, ten_goi VARCHAR(100), gia INT);
  CREATE TABLE IF NOT EXISTS huan_luyen_vien (id INT AUTO_INCREMENT PRIMARY KEY, ten VARCHAR(100), chuyen_mon VARCHAR(100));
  CREATE TABLE IF NOT EXISTS lich_tap (id INT AUTO_INCREMENT PRIMARY KEY, hoi_vien_id INT, thoi_gian DATETIME);
`;
db.query(initDB);

function renderLayout(title, content) {
  return `
  <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title} - Hệ Thống Gym</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
      body { background-color: #f4f6f9; font-family: 'Segoe UI', sans-serif; }
      .navbar { background-color: #2c3e50; }
      .page-title { color: #34495e; font-weight: bold; border-bottom: 3px solid #3498db; padding-bottom: 5px; margin-bottom: 20px; display: inline-block;}
      .table th { text-align: center; }
      .card-dash { border-radius: 10px; transition: 0.3s; }
      .card-dash:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
  </style></head><body>
  <nav class="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top"><div class="container">
      <a class="navbar-brand fw-bold" href="/"><i class="fa-solid fa-dumbbell text-warning me-2"></i>GYM MASTER</a>
      <ul class="navbar-nav ms-auto flex-row gap-3">
          <li class="nav-item"><a class="nav-link text-white" href="/"><i class="fa-solid fa-house"></i> Trang Chủ</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="/hoi-vien"><i class="fa-solid fa-users"></i> Hội Viên</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="/goi-tap"><i class="fa-solid fa-tags"></i> Gói Tập</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="/lich-tap"><i class="fa-solid fa-calendar"></i> Lịch Tập</a></li>
          <li class="nav-item"><a class="nav-link text-white" href="/huan-luyen-vien"><i class="fa-solid fa-user-tie"></i> HLV</a></li>
      </ul>
  </div></nav>
  <div class="container mt-4 mb-5">${content}</div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body></html>`;
}

// ============ TRANG CHỦ ============
app.get('/', (req, res) => {
  const content = `
    <div class="text-center mb-5 mt-3"><h2 class="page-title">Tổng Quan Hệ Thống</h2></div>
    <div class="row g-4">
        <div class="col-md-3"><a href="/hoi-vien" class="text-decoration-none">
            <div class="card card-dash text-center p-4 h-100 shadow-sm"><i class="fa-solid fa-users text-primary mb-3" style="font-size: 3rem;"></i><h4 class="text-dark fw-bold">Hội Viên</h4></div></a></div>
        <div class="col-md-3"><a href="/goi-tap" class="text-decoration-none">
            <div class="card card-dash text-center p-4 h-100 shadow-sm"><i class="fa-solid fa-tags text-success mb-3" style="font-size: 3rem;"></i><h4 class="text-dark fw-bold">Gói Tập</h4></div></a></div>
        <div class="col-md-3"><a href="/lich-tap" class="text-decoration-none">
            <div class="card card-dash text-center p-4 h-100 shadow-sm"><i class="fa-solid fa-calendar text-warning mb-3" style="font-size: 3rem;"></i><h4 class="text-dark fw-bold">Lịch Tập</h4></div></a></div>
        <div class="col-md-3"><a href="/huan-luyen-vien" class="text-decoration-none">
            <div class="card card-dash text-center p-4 h-100 shadow-sm"><i class="fa-solid fa-user-tie text-info mb-3" style="font-size: 3rem;"></i><h4 class="text-dark fw-bold">HLV</h4></div></a></div>
    </div>`;
  res.send(renderLayout('Trang Chủ', content));
});

// ============ 1. MODULE HỘI VIÊN ============
app.get('/hoi-vien', (req, res) => {
  db.query('SELECT * FROM hoi_vien', (err, results) => {
    let rows = '', modals = '';
    results.forEach(r => {
      rows += `<tr>
        <td class="text-center">${r.id}</td><td class="fw-bold">${r.ten}</td><td class="text-center">${r.sdt}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#editModal${r.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
          <form action="/hoi-vien/delete/${r.id}" method="POST" style="display:inline;"><button class="btn btn-sm btn-outline-danger" onclick="return confirm('Chắc chắn xóa?');"><i class="fa-solid fa-trash"></i> Xóa</button></form>
        </td></tr>`;
      modals += `
        <div class="modal fade" id="editModal${r.id}"><div class="modal-dialog"><div class="modal-content">
          <form action="/hoi-vien/edit/${r.id}" method="POST">
            <div class="modal-header bg-primary text-white"><h5 class="modal-title">Sửa Hội Viên</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <label>Họ Tên</label><input type="text" name="ten" class="form-control mb-2" value="${r.ten}" required>
              <label>SĐT</label><input type="text" name="sdt" class="form-control" value="${r.sdt}" required>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-primary">Cập nhật</button></div>
          </form></div></div></div>`;
    });
    const content = `
      <div class="d-flex justify-content-between"><h3 class="page-title">Quản lý Hội Viên</h3>
      <button class="btn btn-primary h-75" data-bs-toggle="modal" data-bs-target="#addModal">+ Thêm Mới</button></div>
      <div class="card shadow-sm"><table class="table table-hover table-bordered m-0"><thead class="table-dark"><tr><th>ID</th><th>Họ & Tên</th><th>Số Điện Thoại</th><th>Thao Tác</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="modal fade" id="addModal"><div class="modal-dialog"><div class="modal-content"><form action="/hoi-vien" method="POST">
        <div class="modal-header bg-primary text-white"><h5 class="modal-title">Thêm Hội Viên</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><label>Họ Tên</label><input type="text" name="ten" class="form-control mb-2" required><label>SĐT</label><input type="text" name="sdt" class="form-control" required></div>
        <div class="modal-footer"><button type="submit" class="btn btn-primary">Lưu</button></div>
      </form></div></div></div> ${modals}`;
    res.send(renderLayout('Hội Viên', content));
  });
});
app.post('/hoi-vien', (req, res) => db.query('INSERT INTO hoi_vien (ten, sdt) VALUES (?, ?)', [req.body.ten, req.body.sdt], () => res.redirect('/hoi-vien')));
app.post('/hoi-vien/edit/:id', (req, res) => db.query('UPDATE hoi_vien SET ten=?, sdt=? WHERE id=?', [req.body.ten, req.body.sdt, req.params.id], () => res.redirect('/hoi-vien')));
app.post('/hoi-vien/delete/:id', (req, res) => db.query('DELETE FROM hoi_vien WHERE id=?', [req.params.id], () => res.redirect('/hoi-vien')));

// ============ 2. MODULE GÓI TẬP ============
app.get('/goi-tap', (req, res) => {
  db.query('SELECT * FROM goi_tap', (err, results) => {
    let rows = '', modals = '';
    results.forEach(r => {
      rows += `<tr>
        <td class="text-center">${r.id}</td><td class="fw-bold">${r.ten_goi}</td><td class="text-center text-danger fw-bold">${r.gia} VNĐ</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-success me-1" data-bs-toggle="modal" data-bs-target="#editModal${r.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
          <form action="/goi-tap/delete/${r.id}" method="POST" style="display:inline;"><button class="btn btn-sm btn-outline-danger" onclick="return confirm('Chắc chắn xóa?');"><i class="fa-solid fa-trash"></i> Xóa</button></form>
        </td></tr>`;
      modals += `
        <div class="modal fade" id="editModal${r.id}"><div class="modal-dialog"><div class="modal-content">
          <form action="/goi-tap/edit/${r.id}" method="POST">
            <div class="modal-header bg-success text-white"><h5 class="modal-title">Sửa Gói Tập</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <label>Tên Gói</label><input type="text" name="ten_goi" class="form-control mb-2" value="${r.ten_goi}" required>
              <label>Giá (VNĐ)</label><input type="number" name="gia" class="form-control" value="${r.gia}" required>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-success">Cập nhật</button></div>
          </form></div></div></div>`;
    });
    const content = `
      <div class="d-flex justify-content-between"><h3 class="page-title">Quản lý Gói Tập</h3><button class="btn btn-success h-75" data-bs-toggle="modal" data-bs-target="#addModal">+ Thêm Mới</button></div>
      <div class="card shadow-sm"><table class="table table-hover table-bordered m-0"><thead class="table-dark"><tr><th>ID</th><th>Tên Gói</th><th>Giá Tiền</th><th>Thao Tác</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="modal fade" id="addModal"><div class="modal-dialog"><div class="modal-content"><form action="/goi-tap" method="POST">
        <div class="modal-header bg-success text-white"><h5 class="modal-title">Thêm Gói Tập</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><label>Tên Gói</label><input type="text" name="ten_goi" class="form-control mb-2" required><label>Giá (VNĐ)</label><input type="number" name="gia" class="form-control" required></div>
        <div class="modal-footer"><button type="submit" class="btn btn-success">Lưu</button></div>
      </form></div></div></div> ${modals}`;
    res.send(renderLayout('Gói Tập', content));
  });
});
app.post('/goi-tap', (req, res) => db.query('INSERT INTO goi_tap (ten_goi, gia) VALUES (?, ?)', [req.body.ten_goi, req.body.gia], () => res.redirect('/goi-tap')));
app.post('/goi-tap/edit/:id', (req, res) => db.query('UPDATE goi_tap SET ten_goi=?, gia=? WHERE id=?', [req.body.ten_goi, req.body.gia, req.params.id], () => res.redirect('/goi-tap')));
app.post('/goi-tap/delete/:id', (req, res) => db.query('DELETE FROM goi_tap WHERE id=?', [req.params.id], () => res.redirect('/goi-tap')));

// ============ 3. MODULE HUẤN LUYỆN VIÊN ============
app.get('/huan-luyen-vien', (req, res) => {
  db.query('SELECT * FROM huan_luyen_vien', (err, results) => {
    let rows = '', modals = '';
    results.forEach(r => {
      rows += `<tr>
        <td class="text-center">${r.id}</td><td class="fw-bold">${r.ten}</td><td class="text-center">${r.chuyen_mon}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-info me-1" data-bs-toggle="modal" data-bs-target="#editModal${r.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
          <form action="/huan-luyen-vien/delete/${r.id}" method="POST" style="display:inline;"><button class="btn btn-sm btn-outline-danger" onclick="return confirm('Chắc chắn xóa?');"><i class="fa-solid fa-trash"></i> Xóa</button></form>
        </td></tr>`;
      modals += `
        <div class="modal fade" id="editModal${r.id}"><div class="modal-dialog"><div class="modal-content">
          <form action="/huan-luyen-vien/edit/${r.id}" method="POST">
            <div class="modal-header bg-info text-dark"><h5 class="modal-title">Sửa HLV</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <label>Tên HLV</label><input type="text" name="ten" class="form-control mb-2" value="${r.ten}" required>
              <label>Chuyên Môn</label><input type="text" name="chuyen_mon" class="form-control" value="${r.chuyen_mon}" required>
            </div>
            <div class="modal-footer"><button type="submit" class="btn btn-info">Cập nhật</button></div>
          </form></div></div></div>`;
    });
    const content = `
      <div class="d-flex justify-content-between"><h3 class="page-title">Quản lý HLV</h3><button class="btn btn-info h-75" data-bs-toggle="modal" data-bs-target="#addModal">+ Thêm Mới</button></div>
      <div class="card shadow-sm"><table class="table table-hover table-bordered m-0"><thead class="table-dark"><tr><th>ID</th><th>Họ & Tên</th><th>Chuyên Môn</th><th>Thao Tác</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="modal fade" id="addModal"><div class="modal-dialog"><div class="modal-content"><form action="/huan-luyen-vien" method="POST">
        <div class="modal-header bg-info text-dark"><h5 class="modal-title">Thêm HLV</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><label>Tên HLV</label><input type="text" name="ten" class="form-control mb-2" required><label>Chuyên Môn</label><input type="text" name="chuyen_mon" class="form-control" required></div>
        <div class="modal-footer"><button type="submit" class="btn btn-info">Lưu</button></div>
      </form></div></div></div> ${modals}`;
    res.send(renderLayout('HLV', content));
  });
});
app.post('/huan-luyen-vien', (req, res) => db.query('INSERT INTO huan_luyen_vien (ten, chuyen_mon) VALUES (?, ?)', [req.body.ten, req.body.chuyen_mon], () => res.redirect('/huan-luyen-vien')));
app.post('/huan-luyen-vien/edit/:id', (req, res) => db.query('UPDATE huan_luyen_vien SET ten=?, chuyen_mon=? WHERE id=?', [req.body.ten, req.body.chuyen_mon, req.params.id], () => res.redirect('/huan-luyen-vien')));
app.post('/huan-luyen-vien/delete/:id', (req, res) => db.query('DELETE FROM huan_luyen_vien WHERE id=?', [req.params.id], () => res.redirect('/huan-luyen-vien')));

// ============ 4. MODULE LỊCH TẬP ============
app.get('/lich-tap', (req, res) => {
  db.query('SELECT * FROM lich_tap', (err, results) => {
    let rows = '', modals = '';
    if(results) {
      results.forEach(r => {
        let time = r.thoi_gian ? new Date(r.thoi_gian).toLocaleString('vi-VN') : '';
        let localDatetime = '';
        if(r.thoi_gian) {
          let dateObj = new Date(r.thoi_gian);
          dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
          localDatetime = dateObj.toISOString().slice(0,16);
        }
        
        rows += `<tr>
          <td class="text-center">${r.id}</td><td class="fw-bold">ID Hội Viên: ${r.hoi_vien_id}</td><td class="text-center text-primary fw-bold">${time}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-warning text-dark fw-bold me-1" data-bs-toggle="modal" data-bs-target="#editModal${r.id}"><i class="fa-solid fa-pen"></i> Sửa</button>
            <form action="/lich-tap/delete/${r.id}" method="POST" style="display:inline;"><button class="btn btn-sm btn-outline-danger" onclick="return confirm('Chắc chắn xóa lịch này?');"><i class="fa-solid fa-trash"></i> Xóa</button></form>
          </td></tr>`;
          
        modals += `
          <div class="modal fade" id="editModal${r.id}"><div class="modal-dialog"><div class="modal-content">
            <form action="/lich-tap/edit/${r.id}" method="POST">
              <div class="modal-header bg-warning text-dark"><h5 class="modal-title fw-bold">Sửa Lịch Tập</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
              <div class="modal-body">
                <label>ID Hội Viên</label><input type="number" name="hoi_vien_id" class="form-control mb-3" value="${r.hoi_vien_id}" required>
                <label>Thời Gian</label><input type="datetime-local" name="thoi_gian" class="form-control" value="${localDatetime}" required>
              </div>
              <div class="modal-footer"><button type="submit" class="btn btn-warning fw-bold text-dark">Cập nhật</button></div>
            </form></div></div></div>`;
      });
    }
    
    const content = `
      <div class="d-flex justify-content-between"><h3 class="page-title">Quản lý Lịch Tập</h3><button class="btn btn-warning text-dark fw-bold h-75" data-bs-toggle="modal" data-bs-target="#addModal">+ Xếp Lịch</button></div>
      <div class="card shadow-sm"><table class="table table-hover table-bordered m-0"><thead class="table-dark"><tr><th>Mã Lịch</th><th>ID Hội Viên</th><th>Thời Gian</th><th>Thao Tác</th></tr></thead><tbody>${rows}</tbody></table></div>
      
      <div class="modal fade" id="addModal"><div class="modal-dialog"><div class="modal-content"><form action="/lich-tap" method="POST">
        <div class="modal-header bg-warning text-dark"><h5 class="modal-title fw-bold">Xếp Lịch Tập Mới</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
          <label>Nhập ID Hội Viên</label><input type="number" name="hoi_vien_id" class="form-control mb-3" required>
          <label>Chọn Ngày & Giờ</label><input type="datetime-local" name="thoi_gian" class="form-control" required>
        </div>
        <div class="modal-footer"><button type="submit" class="btn btn-warning fw-bold text-dark">Lưu Lịch</button></div>
      </form></div></div></div> ${modals}`;
      
    res.send(renderLayout('Lịch Tập', content));
  });
});
app.post('/lich-tap', (req, res) => db.query('INSERT INTO lich_tap (hoi_vien_id, thoi_gian) VALUES (?, ?)', [req.body.hoi_vien_id, req.body.thoi_gian], () => res.redirect('/lich-tap')));
app.post('/lich-tap/edit/:id', (req, res) => db.query('UPDATE lich_tap SET hoi_vien_id=?, thoi_gian=? WHERE id=?', [req.body.hoi_vien_id, req.body.thoi_gian, req.params.id], () => res.redirect('/lich-tap')));
app.post('/lich-tap/delete/:id', (req, res) => db.query('DELETE FROM lich_tap WHERE id=?', [req.params.id], () => res.redirect('/lich-tap')));

app.listen(3000, () => console.log('Server Web đang chạy trên cổng 3000'));
