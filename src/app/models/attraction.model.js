module.exports = mongoose => {
    const Attraction = mongoose.model(
      "attraction",
      mongoose.Schema(
        {
          name: String,
          description: String,
          review: Number,
          comments: Array
        },
        { timestamps: true }
      )
    );
  
    return Attraction;
  };