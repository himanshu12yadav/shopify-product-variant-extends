const getProductQuery = `
import { tsconfigPaths } from 'vite-tsconfig-paths';
query getProductId($handle: String!){
  productByHandle(handle:$handle){
    id
    title
    handle
    description
    vendor
    tags
    createdAt
    updatedAt
  }
}`;

export async function getProductId(admin, handle) {
  const response = await admin.graphql(getProductQuery, {
    handle: handle,
  });

  if (response.productByHandle) {
    return response.productByHandle.id;
  } else {
    throw new Error(`Product with handle ${handle} not found`);
  }
}

export default {
  getProductId,
};
