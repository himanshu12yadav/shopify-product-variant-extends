const productVariantCreateMutation = `
mutation productVariantCreate($input: ProductVariantCreateInput!) {
  productVariantCreate(input: $input){
    product{
      id
      title
    }

    productVariant{
      id
      title
      sku
      price
      inventoryQuantity
    }
    userErrors {
      field
      message
    }
  }
}`;

async function productVariantCreate(admin, input) {
  const response = await admin.graphql(productVariantCreateMutation, {
    input: {
      productId: input.productId,
      title: input.title,
      sku: input.sku,
      price: input.price,
      inventoryQuantity: input.inventoryQuantity,
      options: input.options,
    },
  });

  if (response.productVariantCreate.userErrors.length > 0) {
    throw new Error(response.productVariantCreate.userErrors[0].message);
  }

  return response.productVariantCreate;
}

export default  {
  productVariantCreateMutation,
  productVariantCreate,
};
