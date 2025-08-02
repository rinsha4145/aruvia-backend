import Cart from "../models/cart.model.js";

export const getCart = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("userId", id);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User userId is required",
      });
    }
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.productId"
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for the given user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.params.id;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const existingProduct = cart.products.find(
        (item) => item.productId?.toString() === productId?.toString()
      );

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product already exists in the cart",
        });
      } else {
        cart.products.push({ productId });
      }

      await cart.save();
    } else {
      cart = new Cart({
        user: userId,
        products: [{ productId }],
      });

      await cart.save();
    }

    const populatedCart = await cart.populate("products.productId");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};


//update cart item quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
  const userId = req.params.id;
    const { productId,quantity } = req.body;
    if (!userId || !productId === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID, Product ID, and quantity are required",
      });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const product = cart.products.find(
      (item) => item.productId?.toString() === productId?.toString()
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
    product.quantity = quantity;
    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating cart item quantity",
      error: error.message,
    });
  }
};

// remove item from cart
export const removeFromCart = async (req, res) => {
  try {
     const userId = req.params.id;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.products = cart.products.filter(
      (item) => item.productId?.toString() !== productId?.toString()
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing from cart",
      error: error.message,
    });
  }
};

//clear cart data after payment
export const clearCart = async (req, res) => {
  try {
   const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.products = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};
