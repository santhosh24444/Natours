const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const apifeatures = require('./../utils/api-features');
exports.deleteone = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));

    }
    res.status(204).json({

        status: 'success',
        data: null
    })
});

exports.updateone = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
     }
    );
  if (!doc) {
    return next(new AppError('No tour found with that ID', 404));
  }
  
    res.status(200).json({
      status: 'success',
      data: {
    data: doc
      }
    });
 
});
    
exports.createone=Model=>catchAsync(async (req, res) => {
  
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
   
});

exports.getone = (Model, propoptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (propoptions) query = query.populate(propoptions);
    const doc = await Model.findById(req.params.id).populate('reviews');
    if (!doc) {
    return  next(new AppError('No document  found with that id',404));
   }
  
    res.status(200).json({
      status: 'success',
      data: {
        data:doc
      }
    });
})
exports.getall = Model => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourid) filter = { tour: req.params.tourid };
  const features = new apifeatures(Model.find(), req.query).filter().sort().limitfeilds().pagination();
  const doc = await features.query;
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,

    result: doc.length,
    data: {
      data:doc
    }
  });
  
});
