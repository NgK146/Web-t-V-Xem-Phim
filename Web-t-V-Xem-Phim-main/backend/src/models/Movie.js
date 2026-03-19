import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  poster:      { type: String, required: true },
  trailer:     { type: String },
  genre:       [{ type: String }],
  director:    { type: String },
  cast:        [{ type: String }],
  duration:    { type: Number, required: true }, // phút
  releaseDate: { type: Date, required: true },
  endDate:     { type: Date },
  language:    { type: String, default: 'Vietsub' },
  rated:       { type: String, enum: ['P', 'K', 'T13', 'T16', 'T18'], default: 'P' },
  status:      { type: String, enum: ['coming_soon', 'now_showing', 'ended'], default: 'coming_soon' },
  avgRating:   { type: Number, default: 0, min: 0, max: 10 },
  totalRatings:{ type: Number, default: 0 },
}, { timestamps: true });

movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'textSearchLang' });
movieSchema.index({ status: 1, releaseDate: -1 });

movieSchema.statics.calcAverageRatings = async function(movieId) {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(movieId, {
      totalRatings: stats[0].nRating,
      avgRating: Math.round(stats[0].avgRating * 10) / 10
    });
  } else {
    await this.findByIdAndUpdate(movieId, {
      totalRatings: 0,
      avgRating: 0
    });
  }
};

export default mongoose.model('Movie', movieSchema);
