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
    poster: 'https://res.cloudinary.com/dvy9uugvu/image/upload/v1711411200/cinema/gap-lai-chi-bau.jpg',
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
    poster: 'https://res.cloudinary.com/dvy9uugvu/image/upload/v1711411200/cinema/dune-2.jpg',
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
    poster: 'https://res.cloudinary.com/dvy9uugvu/image/upload/v1711411200/cinema/kungfu-panda-4.jpg',
    duration: 94,
    releaseDate: new Date('2024-03-08'),
    status: 'now_showing',
    rated: 'P',
    genre: ['Hoạt hình', 'Hài', 'Hành động'],
    director: 'Mike Mitchell',
    cast: ['Jack Black', 'Awkwafina'],
    textSearchLang: 'none'
  },
  {
    title: 'Mai',
    description: 'Câu chuyện về cuộc đời và tình yêu của Mai, một người phụ nữ làm nghề massage.',
    poster: 'https://res.cloudinary.com/dvy9uugvu/image/upload/v1711411200/cinema/mai-movie.jpg',
    duration: 131,
    releaseDate: new Date('2024-02-10'),
    status: 'now_showing',
    rated: 'T18',
    genre: ['Tâm lý', 'Tình cảm'],
    director: 'Trấn Thành',
    cast: ['Phương Anh Đào', 'Tuấn Trần'],
    textSearchLang: 'none'
  }
];

export const cinemasData = [
  { name: 'CGV Vincom Bà Triệu', address: '191 Bà Triệu, Hai Bà Trưng', city: 'Hà Nội', phone: '1900 6017' },
  { name: 'CGV Aeon Mall Long Biên', address: '27 Cổ Linh, Long Biên', city: 'Hà Nội', phone: '1900 6017' },
  { name: 'CGV Sư Vạn Hạnh', address: '11 Sư Vạn Hạnh, Quận 10', city: 'Hồ Chí Minh', phone: '1900 6017' },
  { name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du, Quận 1', city: 'Hồ Chí Minh', phone: '1900 1111' }
];

export const discountsData = [
  {
    code: 'WELCOME2024',
    type: 'percent',
    value: 10,
    minOrder: 100000,
    maxDiscount: 50000,
    usageLimit: 100,
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    isActive: true
  },
  {
    code: 'CINEVIP50',
    type: 'fixed',
    value: 50000,
    minOrder: 200000,
    maxDiscount: 50000,
    usageLimit: 50,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    isActive: true
  }
];
