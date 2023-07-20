const mongoose = require('mongoose');
const Tour = require('./tourmodels');
const reviewschema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tour',
        required:[true,'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, 'Review must belong to a user']
    },
    
},{
    toJSON: { virtuals: true },
        toObject:{virtuals:true}
});
reviewschema.index({ tour: 1, user: 1 }, { unique: true });
reviewschema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select:'name photo'/*populate */
    })
    next();
})    
reviewschema.statics.calcaverageratings = async function (tourid) {
   const stats= await this.aggregate([/*this static methos is ued to find the averagerating if any updates happen */
        { $match: { tour: tourid } },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgrating:{$avg:'$rating'}
        }}
   ])
    console.log(stats);
    if (stats.length > 0) {
           await Tour.findByIdAndUpdate(tourid,{ratingsQuantity:stats[0].nRating,ratingsAverage:stats[0].avgrating})

        
    } else {
        await Tour.findByIdAndUpdate(tourid, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })

        
    }
}/*this keyword points to the current model */
reviewschema.post('save', function () {
    //thispoints the current review
    this.constructor.calcaverageratings(this.tour);
})
reviewschema.pre(/^findOneAnd/, async function (next) {
        console.log(this)

    this.r = await this.findOne();
    next();
})
reviewschema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcaverageratings(this.r.tour);
})
const review = mongoose.model('review', reviewschema);
module.exports = review;