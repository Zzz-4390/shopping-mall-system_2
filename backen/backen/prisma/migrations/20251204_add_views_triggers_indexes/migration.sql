-- =============================================
-- 1. 新增索引（对应 Prisma schema 变更）
-- =============================================
-- message 表：会话+时间复合索引，加速按 conversationid 查询并按时间排序
-- 先删除已存在的索引（如果存在），再创建
DROP INDEX `idx_conversation_sendtime` ON `message`;
CREATE INDEX `idx_conversation_sendtime` ON `message` (`conversationid`, `sendtime`);

-- product 表：状态+分类+发布时间复合索引，加速商品列表筛选
DROP INDEX `idx_product_listing` ON `product`;
CREATE INDEX `idx_product_listing` ON `product` (`status`, `category`, `publishtime`);

-- cartitem 表：购物车+商品唯一约束（防止同一商品重复加入购物车）
-- 注意：如果约束已存在会报错，可忽略
ALTER TABLE `cartitem` ADD CONSTRAINT `cart_product_unique` UNIQUE (`cartid`, `productid`);


-- =============================================
-- 2. 视图：用户订单详情视图 vw_user_order_detail
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
-- 3. 视图：购物车明细视图 vw_cart_detail
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
-- 4. 触发器：用户注册后自动创建购物车
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
-- 5. 触发器：订单创建后自动将商品状态改为 PENDING_SALE
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
-- 6. 触发器：订单完成后自动将商品状态改为 SOLD
-- =============================================
DROP TRIGGER IF EXISTS `trg_orders_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_orders_after_update`
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    -- 当 isdone 从 false/null 变为 true 时，更新商品状态为已售
    IF (OLD.isdone IS NULL OR OLD.isdone = FALSE) AND NEW.isdone = TRUE THEN
        UPDATE `product`
        SET `status` = 'SOLD'
        WHERE `productid` = NEW.productid;
    END IF;
END$$
DELIMITER ;
