const mongoose = require('mongoose');
const slugify = require('slugify');
const user = require('./usermodel');
const validator = require('validator');
const toursschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal to 40 charcters'],
    minlength: [10, 'A tour name should be greater than 10 characters']
    
  },
  guides: [{
    type: mongoose.Schema.Types.ObjectId,/* just a mongo db id*/
    ref: "user"
  }],

  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty'],
    enum: {
      values: ['easy', 'difficult', 'medium'],
      message: "Difficulty must be 'easy, medium,difficult"
    }
  },
  ratingsAverage: {
    type: 'Number',
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating should be less than 5.0'],
    set:val=>Math.round(val*10)/10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price
      
      },
      message:"Discount price ({VALUE}) should be below regular price"
    }
  },
  summary: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  description: {
    type: String,
    required: [true, 'A tour must have description']
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation:{
    
    type: {
      type: String,
      default: 'Point',/*it is a geometry to ensure the strat location,it can be anything like polygon square etc*/
      enum:['Point']
    },
    coordinates: [Number],
    address: String,
    description:String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum:['Point']
    },
    coordinates: [Number],
    address: String,
    description: String,
    day:Number
  }]
 
},
  {
    toJSON:{ virtuals:true},
    toObject:{virtuals:true}
  });
toursschema.index({ price: 1, ratingsAverage: -1 });/*we use this reduce thye performance */
toursschema.index({ slug: 1 });
toursschema.index({ startLocation: '2dsphere' });
toursschema.virtual('durationweeks').get(function () {
  return this.duration / 7;
});
toursschema.virtual('reviews'/*name of the feild in the output*/, {
  ref: 'review',
  foreignField: 'tour',
  localField:'_id'
})//this is virtual populate 
toursschema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
})
// toursschema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => user.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// })
// toursschema.post('save', function (doc, next) {
//   next();
// })
toursschema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start=Date.now();
  next();
})
toursschema.pre(/^find/, function (next) {
  this.populate({
   path: 'guides', select: '-__v -passwordChangedAt' 
  })
  next();
})
toursschema.post(/^find/, function (docs, next) {
  next();
})
// toursschema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// })
const tour = mongoose.model('tour', toursschema);
module.exports = tour;
