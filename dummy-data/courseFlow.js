export const courseFlow = [
  { id: "guide", title: "Course Guide", type: "text" },
  { id: "outline", title: "Outline Course", type: "text" },

  // --- Pre Test ---
  {
    id: "pretest",
    title: "Pre Test",
    type: "quiz",
    questions: [
      {
        id: 1,
        question: "Apa kepanjangan dari K3?",
        options: [
          "Keselamatan dan Kesehatan Kerja",
          "Kegiatan Kantor Karyawan",
          "Kebijakan Kebersihan Kantor",
          "Komunitas Keamanan Kerja",
        ],
        answer: 0,
      },
      {
        id: 2,
        question: "Alat pelindung diri yang wajib dipakai saat pengelasan?",
        options: ["Masker", "Helm Las", "Sarung Tangan Biasa", "Sepatu Kets"],
        answer: 1,
      },
      {
        id: 3,
        question: "Gas apa yang biasa digunakan pada proses las MIG?",
        options: ["Oksigen", "Argon/CO2", "Nitrogen", "Helium"],
        answer: 1,
      },
    ],
  },

  // --- Materi Utama ---
  {
    id: "course",
    title: "Course",
    type: "group",
    children: [
      { id: "lesson1", title: "Teknik Dasar Pengelasan", type: "pdf" },
      { id: "lesson2", title: "Video Teknik Dasar Pengelasan", type: "video" },
      { id: "lesson3", title: "PPT Teknik Dasar Pengelasan", type: "ppt" },
      { id: "materi1", title: "Materi Keselamatan", type: "text" },
      { id: "video1", title: "Video Praktik", type: "video" },
    ],
  },

  // --- Post Test ---
  {
    id: "posttest",
    title: "Post Test",
    type: "quiz",
    questions: [
      {
        id: 4,
        question: "APD yang melindungi mata dari percikan api adalah?",
        options: ["Sarung Tangan", "Kacamata Safety", "Masker", "Helm"],
        answer: 1,
      },
      {
        id: 5,
        question: "Bagian tubuh yang harus selalu ditutup saat mengelas?",
        options: ["Kepala", "Mata", "Seluruh tubuh", "Kaki"],
        answer: 2,
      },
    ],
  },
];
