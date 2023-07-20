const tour = require('./../models/tourmodels');
const catchAsync = require('./../utils/catchAsync');
const apifeatures = require('./../utils/api-features');
const AppError = require('../utils/appError');
const factory = require('./handlefactory');
exports.aliastoptours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,summary,difficulty';
  next();
};



exports.getAllTours = factory.getall(tour);




exports.getTour = factory.getone(tour, { path: 'reviews' });


exports.createTour = factory.createone(tour);

exports.updateTour = factory.updateone(tour);
exports.deleteTour = factory.deleteone(tour);

// exports.deleteTour =catchAsync( async (req, res,next) => {
//   await tour.findByIdAndDelete(req.params.id, (err) => {
//       if (err) {
//         return next(new AppError('No tour found with that ID', 404));
//       }
//     });

//     res.status(204).json({
//       status: 'success'
//     });
  
// });

exports.gettourstatus = catchAsync(async (req, res) => {
  
    const stats = await tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: '$difficulty',
          numtours:{$sum:1},
          avgrating: { $avg: '$ratingsAverage' },
          avgprice: { $avg: '$price' },
          minprice: { $avg: '$price'},
        maxprice:{$avg:'price'}
        }
        
      }
    ])
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
    
 
})

exports.getmonthlypplan = catchAsync(async (req, res) => {
    const year = req.params.year * 1;
    const plan = await tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
         $match: {
           startDates: {
             $gte: new Date(`${year}-01-01`),
             $lte: new Date(`${year}-12-31`)
           }
         }
        
       },
       {
         $group: {
           _id: { $month: '$startDates' },
           numTourstarts: {
             $sum:1
           },
           tours:{$push:'$name'}
         }

       },
       {
         $addFields:{month:'$_id'}
      },
      {
        $project: {
         _id: 0
        }
      },
      {
        $sort: {numTourstarts:-1}
      }, {
        $limit: 12
      }
    ]);
    res.status(200).json({
      message: 'success',
      data: {
        plan
      }
    });
  

})
exports.gettourswithin = catchAsync(async(req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
  }
  const tours = await tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});

  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: "success",
    results:tours.length,
    data:tours

  })
});
exports.getdistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng ] = latlng.split(',').map(Number);
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
  }

  const distances = await tour.aggregate([{
    $geoNear:
    {
      near: {
        type: 'Point',
        coordinates: [lng * 1, lat * 1]
      },
      distanceField: 'distance',
      distanceMultiplier:multiplier
    }
  }, {
    $project: {
      distance: 1,
      name:1
    }
    }])
  res.status(200).json({
    status: 'success',
    
    data: {
      data:distances
    }
  })
})