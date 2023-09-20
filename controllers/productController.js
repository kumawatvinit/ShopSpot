import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import fs from "fs";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const CreateProductController = async (req, res) => {
  try {
    // console.log(req.fields);

    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      case !description:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      case !price:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Price is required",
        });
      case !category:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      case !quantity:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Quantity is required",
        });
      case !photo:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      case photo.size > 1024 * 1024 * 2:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Image size should be less than 2MB",
        });
    }

    // check for existing product
    const existingProduct = await productModel.findOne({ name });

    if (existingProduct) {
      // removeTmp(photo.path);
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in product creation",
      error,
    });
  }
};

export const UpdateProductController = async (req, res) => {
  try {
    // console.log(req.fields);

    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      case !description:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      case !price:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Price is required",
        });
      case !category:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      case !shipping:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Shipping is required",
        });
      case !quantity:
        // removeTmp(photo.path);
        return res.status(400).json({
          success: false,
          message: "Quantity is required",
        });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    return res.status(201).json({
      success: true,
      message: "Product updated successfully",
      products,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in product update",
      error,
    });
  }
};

export const GetAllProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .sort({ createdAt: -1 });

    // .limit(10)
    return res.status(200).json({
      success: true,
      total: products.length,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting products",
      error,
    });
  }
};

export const GetProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product does not exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting product",
      error,
    });
  }
};

export const DeleteProductController = async (req, res) => {
  try {
    const pid = req.params.pid;

    const existingProduct = await productModel.findById(pid);

    if (!existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product does not exist",
      });
    }

    await productModel.findByIdAndDelete(pid).select("-photo");

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in deleting product",
      error,
    });
  }
};

// get photo
export const GetPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product does not exist",
      });
    }

    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }

    return res.status(400).json({
      success: false,
      message: "No photo found",
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting photo",
      error,
    });
  }
};

// filter products
export const ProductFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};

    if (checked.length > 0) args.category = checked;
    if (radio.length)
      args.price = {
        $gte: radio[0],
        $lte: radio[1],
      };

    const products = await productModel.find(args).populate("category");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in filtering products",
      error,
    });
  }
};

// total products count
export const TotalProductsController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();

    return res.status(200).json({
      success: true,
      total,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in getting total products",
      error,
    });
  }
};

// pagination
export const ProductPerPageController = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const perPage = 5;

    const products = await productModel
      .find({})
      .select("-photo")
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("category");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in getting products per page",
      error,
    });
  }
};

// search products
export const SearchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;

    const products = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo")
      .populate("category");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in searching products",
      error,
    });
  }
};

// related products
export const RelatedProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid);

    const products = await productModel
      .find({
        _id: { $ne: product._id },
        category: product.category._id,
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in finding related products",
      error,
    });
  }
};

// categories with product count in each category
export const CategoriesWithProductCountController = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          count: { $size: "$products" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in getting categories with product count",
      error,
    });
  }
};

// get products by category
export const ProductByCategoryController = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const perPage = 5;

    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel
      .find({ category })
      .select("-photo")
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("category");

    return res.status(200).json({
      success: true,
      category,
      products,
    });
  } catch (error) {
    // console.log(error);

    return res.status(400).json({
      success: false,
      message: "Error in getting products by category",
      error,
    });
  }
};

// total products count by category
export const TotalProductsCountByCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Count the total number of products in the found category
    const total = await productModel.countDocuments({ category });

    return res.status(200).json({
      success: true,
      total,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "Error in getting total products by category",
      error,
    });
  }
};

// payment gateway api
export const GetBraintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) return res.status(500).send(err);
      return res.status(200).send(response);
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting braintree token",
      error,
    });
  }
};

export const BraintreePaymentController = async (req, res) => {
  try {
    const { nonce, productsArray } = req.body;
    let total = productsArray.reduce(
      (total, item) => total + item.product.price * item.count,
      0
    );

    let transaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // console.log(JSON.stringify(result));

          const order = new orderModel({
            products: productsArray.map((item) => ({
              product: item.product._id, 
              count: item.count,
            })),
            payment: result,
            buyer: req.user._id,
          }).save();

          // console.log(order);

          return res.status(200).json({
            success: true,
            message: "Payment successful",
            order,
          });
        } else {
          // console.error(result.message);

          return res.status(500).json({
            success: false,
            message: "Payment failed",
            error,
          });
        }
      }
    );
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in braintree payment",
      error,
    });
  }
};
