const ProductDetail = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//create product :-admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await ProductDetail.create(req.body);
  res.status(201).json({
    success: true,
    product
  })
})
///get all product
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productsCount = await ProductDetail.countDocuments();
  const apiFeauture = new ApiFeatures(ProductDetail.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
  
  const products = await apiFeauture.query;
  let filteredProductsCount = products.length;
apiFeauture.pagination(resultPerPage)
  // const products=await ProductDetail.find()
  res.status(200).json
    ({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });

})

///update product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await ProductDetail.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found"))
  }
  product = await ProductDetail.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true,
    product,
    productCount
  })
})
//delete product
exports.deleteProduct = catchAsyncErrors(
  async (req, res, next) => {
    const product = await ProductDetail.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("product not found"))
    }
    await product.remove();
    res.status(200).json({
      status: true,
      message: "product delete successfully"
    })
  }
)



///get single products details

exports.getProductDetails = catchAsyncErrors(
  async (req, res, next) => {
    const product = await ProductDetail.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("product not found"))
    }

    res.status(200).json({
      status: true,
      product
    })
  }
)


// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, name, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await ProductDetail.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});


// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductDetail.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    review: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductDetail.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await ProductDetail.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});



