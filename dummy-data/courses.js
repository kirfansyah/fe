// dummy-data/courses.js

const titles = [
  "Keselamatan Kerja Dasar",
  "Keselamatan Kerja Lanjutan",
  "Manajemen Risiko Dasar",
  "Manajemen Risiko Lanjutan",
  "Pelatihan Alat Pelindung Diri",
  "Pelatihan Evakuasi Darurat",
  "Pemadaman Kebakaran",
  "Pertolongan Pertama",
  "Kesehatan dan Keselamatan Lingkungan",
  "Pengelolaan Bahan Kimia",
  "Keselamatan Listrik",
  "Audit K3 Internal",
  "Kesadaran Lingkungan",
  "Pengelolaan Limbah",
  "Prosedur Keadaan Darurat",
  "Investigasi Kecelakaan",
  "Budaya Keselamatan",
  "Keselamatan di Laboratorium",
  "Ergonomi Kerja",
  "Keselamatan di Area Konstruksi",
];

export const generateCourses = Array.from({ length: 6 }, (_, i) => {
  const title =
    titles[i % titles.length] + ` Batch ${Math.floor(i / titles.length) + 1}`;

  const allCategories = ["General", "Mandatory", "All Employee"];
  const randomCount = Math.floor(Math.random() * allCategories.length) + 1;
  const categories = allCategories
    .sort(() => 0.5 - Math.random())
    .slice(0, randomCount);

  const statuses = ["Passed", "On Going", "Failed"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // 🎯 Tambahan data statistik peserta
  const invited = Math.floor(Math.random() * 100) + 20; // total yang diundang
  const onGoing = Math.floor(Math.random() * invited * 0.5); // setengahnya mungkin masih jalan
  const finished = Math.floor(Math.random() * (invited - onGoing)); // sebagian sudah selesai
  const total = invited; // total peserta sama dengan invited

  return {
    id: i + 1,
    title,
    release: "22-09-2025",
    lesson: Math.floor(Math.random() * 10) + 1,
    duration: `${String(Math.floor(Math.random() * 2)).padStart(
      2,
      "0"
    )}hr ${String(Math.floor(Math.random() * 60)).padStart(2, "0")}min`,
    review: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
    status,
    categories,
    invited,
    onGoing,
    finished,
    total,
  };
});
