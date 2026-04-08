import mongoose from 'mongoose';

const showtimeSeatSchema = new mongoose.Schema({
  seat:   { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt:  { type: Date },
  price:     { type: Number, required: true },
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  movie:     { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },
  startTime: { type: Date, required: true },
  endTime:   { type: Date, required: true },
  basePrice: { type: Number, required: true },
  seats:     [showtimeSeatSchema],
  status:    { type: String, enum: ['scheduled', 'ongoing', 'ended', 'cancelled'], default: 'scheduled' },
  // Display fields for easy database viewing
  movieTitle: { type: String },
  roomName:   { type: String },
  cinemaName: { type: String },
  startTimeDisplay: { type: String },
}, { timestamps: true });

showtimeSchema.index({ movie: 1, startTime: 1 });
showtimeSchema.index({ room: 1, startTime: 1 });

showtimeSchema.pre('save', async function() {
    if (this.isModified('movie') || this.isModified('room') || this.isModified('startTime') || !this.movieTitle) {
      const Movie = mongoose.model('Movie');
      const Room = mongoose.model('Room');
      const Cinema = mongoose.model('Cinema');

      const movie = await Movie.findById(this.movie);
      const room = await Room.findById(this.room).populate('cinema');

      if (movie) this.movieTitle = movie.title;
      if (room) {
        this.roomName = room.name;
        if (room.cinema) this.cinemaName = room.cinema.name;
      }
      if (this.startTime) {
        this.startTimeDisplay = new Date(this.startTime).toLocaleString('vi-VN');
      }
    }
});

export default mongoose.model('Showtime', showtimeSchema);
