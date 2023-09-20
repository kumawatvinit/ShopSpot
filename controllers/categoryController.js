import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import productModel from "../models/productModel.js";

export const CreateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const existingCategory = await categoryModel.findOne({name});

    if(existingCategory) {
        return res.status(200).json({
            success: true,
            message: "Category already exists"
        });
    }

    const category = await new categoryModel({
        name,
        slug: slugify(name)
    }).save();

    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        category
    });

  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in category creation",
      error,
    });
  }
};

export const UpdateCategoryController = async (req, res) => {
    try {
        const { name} = req.body;
        const { id } = req.params;

        if(!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const existingCategory = await categoryModel.findById(id);

        if(!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category does not exist"
            });
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(id, {name, slug: slugify(name)}, {new: true});

        return res.status(200).json({
            success: true,
            message: String(name) + " updated successfully",
            updatedCategory
        });
    } catch(error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in category updation",
            error
        });
    }
};

export const GetAllCategoriesController = async (req, res) => {
    try {
        const categories = await categoryModel.find({});

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch(error) {
        // console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error in getting categories",
            error
        });
    }
};

export const GetCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({slug: req.params.slug});

        if(!category) {
            return res.status(400).json({
                success: false,
                message: "Category does not exist"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            category
        });
    } catch(error) {
        // console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "Error in getting category",
            error
        });
    }
};

export const DeleteCategoryController = async (req, res) => {
    try {
        const id = req.params.id;

        const existingCategory = await categoryModel.findById(id);

        if(!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category does not exist"
            });
        }

        // Delete all products that reference this category
        await productModel.deleteMany({ category: id });

        await categoryModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch(error) {
        // console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error in deleting category",
            error
        });
    }
};