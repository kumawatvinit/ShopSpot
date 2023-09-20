import orderModel from "../models/orderModel.js";

export const GetOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate({
        path: "products.product",
        select: "-photo",
      })
      .populate("buyer", "name")
      .sort("-createdAt");

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting orders",
      error,
    });
  }
};

export const GetAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({
        path: "products.product",
        select: "-photo",
      })
      .populate("buyer", "name")
      .sort("-createdAt");

    return res.status(200).json({
      success: true,
      message: "All Orders fetched successfully",
      orders,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in getting all-orders",
      error,
    });
  }
};

export const UpdateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in updating order status",
      error,
    });
  }
};
