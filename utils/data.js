// data.js — Dữ liệu mẫu seed (HIỂN chạy 1 lần để nạp dữ liệu ban đầu)
let seedData = async function () {
  try {
    let roleModel = require('../schemas/roles');
    let departmentModel = require('../schemas/departments');
    let categoryModel = require('../schemas/categories');

    for (let name of ['ADMIN', 'MANAGER', 'MEMBER']) {
      if (!await roleModel.findOne({ name })) {
        await new roleModel({ name }).save();
        console.log('[Seed] Role:', name);
      }
    }
    for (let name of ['Phòng IT', 'Phòng Marketing', 'Phòng Nhân Sự']) {
      if (!await departmentModel.findOne({ name })) {
        await new departmentModel({ name }).save();
        console.log('[Seed] Dept:', name);
      }
    }
    for (let cat of [{ name: 'Tính năng', slug: 'tinh-nang' }, { name: 'Lỗi', slug: 'loi' }, { name: 'Cải tiến', slug: 'cai-tien' }]) {
      if (!await categoryModel.findOne({ name: cat.name })) {
        await new categoryModel(cat).save();
        console.log('[Seed] Category:', cat.name);
      }
    }
    console.log('[Seed] Hoàn tất!');
  } catch (err) {
    console.error('[Seed] Lỗi:', err.message);
  }
};
module.exports = { seedData };
