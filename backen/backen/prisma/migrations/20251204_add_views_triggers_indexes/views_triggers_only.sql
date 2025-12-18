-- =============================================
-- 视图和触发器 SQL（索引已通过 Prisma db push 创建）
-- =============================================

-- =============================================
-- 1. 视图：用户订单详情视图 vw_user_order_detail
-- =============================================
DROP VIEW IF EXISTS `vw_user_order_detail`;
CREATE VIEW `vw_user_order_detail` AS
SELECT 
    o.orderid,
    o.buyerid,
    o.sellerid,
    o.productid,
    o.createtime,
    o.finishtime,
    o.isdone,
    p.title AS product_title,
    p.price AS product_price,
    p.photo AS product_photo,
    p.status AS product_status,
    p.category AS product_category,
    buyer.name AS buyer_name,
    buyer.phone AS buyer_phone,
    seller.name AS seller_name,
    seller.phone AS seller_phone
FROM orders o
LEFT JOIN product p ON o.productid = p.productid
LEFT JOIN users buyer ON o.buyerid = buyer.userid
LEFT JOIN users seller ON o.sellerid = seller.userid;


-- =============================================
-- 2. 视图：购物车明细视图 vw_cart_detail
-- =============================================
DROP VIEW IF EXISTS `vw_cart_detail`;
CREATE VIEW `vw_cart_detail` AS
SELECT 
    ci.cartitemid,
    ci.cartid,
    ci.productid,
    ci.entertime,
    p.title AS product_title,
    p.content AS product_content,
    p.price AS product_price,
    p.photo AS product_photo,
    p.status AS product_status,
    p.category AS product_category,
    p.sellerid AS product_sellerid,
    c.cartuserid
FROM cartitem ci
LEFT JOIN product p ON ci.productid = p.productid
LEFT JOIN cart c ON ci.cartid = c.cartid;


-- =============================================
-- 3. 触发器：用户注册后自动创建购物车
-- =============================================
DROP TRIGGER IF EXISTS `trg_users_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_users_after_insert`
AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `cart` (`cartid`, `cartuserid`)
    VALUES (UUID(), NEW.userid);
END$$
DELIMITER ;


-- =============================================
-- 4. 触发器：订单创建后自动将商品状态改为 PENDING_SALE
-- =============================================
DROP TRIGGER IF EXISTS `trg_orders_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_orders_after_insert`
AFTER INSERT ON `orders`
FOR EACH ROW
BEGIN
    UPDATE `product` 
    SET `status` = 'PENDING_SALE' 
    WHERE `productid` = NEW.productid;
END$$
DELIMITER ;


-- =============================================
-- 5. 触发器：订单完成后自动将商品状态改为 SOLD
-- =============================================
DROP TRIGGER IF EXISTS `trg_orders_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_orders_after_update`
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF (OLD.isdone IS NULL OR OLD.isdone = FALSE) AND NEW.isdone = TRUE THEN
        UPDATE `product`
        SET `status` = 'SOLD'
        WHERE `productid` = NEW.productid;
    END IF;
END$$
DELIMITER ;
