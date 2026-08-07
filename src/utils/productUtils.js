export function getUniqueProductsByName(products = []) {
  const seen = new Set();
  const unique = [];

  for (const product of products) {
    const nameKey = product && product.name ? product.name.trim().toLowerCase() : '';
    if (!nameKey) continue;
    if (!seen.has(nameKey)) {
      seen.add(nameKey);
      unique.push(product);
    }
  }

  return unique;
}
