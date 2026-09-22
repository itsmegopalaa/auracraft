/*
 * MineNote — normalize legacy product.price values.
 *
 * Canonical storefront pricing lives in product_page_prices.
 * products.price remains as a compatibility/default field.
 *
 * Legacy catalog values ₹299 / ₹349 / ₹399 must not remain
 * as live fallback prices.
 */

update public.products
set price = 849
where price in (299, 349, 399);
