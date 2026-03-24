export const adminData = {
  name: 'System Admin',
  email: 'admin@cinema.com',
  password: 'admin123',
  role: 'admin',
  isVerified: true
};

export const moviesData = [
  {
    title: 'Gặp Lại Chị Bầu',
    description: 'Một anh chàng mồ côi bất ngờ xuyên không về những năm 90 và gặp lại mẹ mình khi bà còn trẻ.',
    poster: 'https://p16-va.lemon8cdn.com/obj/tos-alisg-v-a3e477-sg/oAIfXBI9fBv9QA2EAbmAnAQID8EABmIAQ88f8I',
    duration: 110,
    releaseDate: new Date('2024-02-10'),
    status: 'now_showing',
    rated: 'T13',
    genre: ['Hài', 'Gia đình', 'Tình cảm'],
    director: 'Nhất Trung',
    cast: ['Anh Tú', 'Diệu Nhi', 'Lê Giang'],
    textSearchLang: 'none'
  },
  {
    title: 'Dune: Hành Tinh Cát - Phần 2',
    description: 'Paul Atreides gia nhập bộ tộc Fremen để trả thù cho gia tộc và ngăn chặn thảm họa tương lai.',
    poster: 'https://images.clothes.com/dune-part-two-poster',
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    status: 'now_showing',
    rated: 'T13',
    genre: ['Hành động', 'Viễn tưởng', 'Phiêu lưu'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya'],
    textSearchLang: 'none'
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'Po được triệu tập để trở thành Thủ lĩnh tinh thần của Thung lũng Hòa bình.',
    poster: 'https://images.clothes.com/kung-fu-panda-4-poster',
    duration: 94,
    releaseDate: new Date('2024-03-08'),
    status: 'coming_soon',
    rated: 'P',
    genre: ['Hoạt hình', 'Hài', 'Hành động'],
    director: 'Mike Mitchell',
    cast: ['Jack Black', 'Awkwafina'],
    textSearchLang: 'none'
  }
];

export const cinemasData = [
  { name: 'CGV Vincom Bà Triệu', address: '191 Bà Triệu, Hai Bà Trưng', city: 'Hà Nội' },
  { name: 'CGV Aeon Mall Long Biên', address: '27 Cổ Linh, Long Biên', city: 'Hà Nội' },
  { name: 'Lotte Cinema Landmark', address: 'Tầng 5 Keangnam, Nam Từ Liêm', city: 'Hà Nội' },
  { name: 'BHD Star Phạm Ngọc Thạch', address: 'Tầng 8 Vincom Phạm Ngọc Thạch', city: 'Hà Nội' },
  { name: 'CGV Sư Vạn Hạnh', address: '11 Sư Vạn Hạnh, Quận 10', city: 'Hồ Chí Minh' },
  { name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du, Quận 1', city: 'Hồ Chí Minh' }
];

export const discountData = {
  code: 'WELCOME2024',
  type: 'percent',
  value: 10,
  minOrder: 100000,
  maxDiscount: 50000,
  usageLimit: 100,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  isActive: true
};
