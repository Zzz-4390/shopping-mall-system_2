-- CreateTable
CREATE TABLE `cart` (
    `cartid` CHAR(36) NOT NULL,
    `cartuserid` CHAR(36) NOT NULL,

    INDEX `cartuserid`(`cartuserid`),
    PRIMARY KEY (`cartid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartitem` (
    `cartitemid` CHAR(36) NOT NULL,
    `cartid` CHAR(36) NOT NULL,
    `productid` CHAR(6) NOT NULL,
    `entertime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cartid`(`cartid`),
    INDEX `productid`(`productid`),
    PRIMARY KEY (`cartitemid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `messageid` CHAR(36) NOT NULL,
    `senderid` CHAR(36) NOT NULL,
    `receiverid` CHAR(36) NOT NULL,
    `type` CHAR(6) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `isread` BOOLEAN NOT NULL DEFAULT false,
    `sendtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `receiverid`(`receiverid`),
    INDEX `senderid`(`senderid`),
    PRIMARY KEY (`messageid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `orderid` CHAR(36) NOT NULL,
    `buyerid` CHAR(36) NOT NULL,
    `sellerid` CHAR(36) NOT NULL,
    `productid` CHAR(36) NOT NULL,
    `createtime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `finishtime` DATETIME(0) NULL,
    `isdone` BOOLEAN NULL DEFAULT false,

    INDEX `buyerid`(`buyerid`),
    INDEX `productid`(`productid`),
    INDEX `sellerid`(`sellerid`),
    PRIMARY KEY (`orderid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `productid` CHAR(36) NOT NULL,
    `sellerid` CHAR(36) NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `price` INTEGER NOT NULL,
    `photo` MEDIUMBLOB NULL,
    `status` CHAR(10) NOT NULL,
    `publishtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `category` CHAR(10) NOT NULL,

    INDEX `sellerid`(`sellerid`),
    PRIMARY KEY (`productid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userid` CHAR(36) NOT NULL,
    `phone` CHAR(11) NOT NULL,
    `password` VARCHAR(20) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `photo` MEDIUMBLOB NULL,
    `registertime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `phone`(`phone`),
    PRIMARY KEY (`userid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`cartuserid`) REFERENCES `users`(`userid`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cartitem` ADD CONSTRAINT `cartitem_ibfk_1` FOREIGN KEY (`productid`) REFERENCES `product`(`productid`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cartitem` ADD CONSTRAINT `cartitem_ibfk_2` FOREIGN KEY (`cartid`) REFERENCES `cart`(`cartid`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`senderid`) REFERENCES `users`(`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_ibfk_2` FOREIGN KEY (`receiverid`) REFERENCES `users`(`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyerid`) REFERENCES `users`(`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`sellerid`) REFERENCES `users`(`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`productid`) REFERENCES `product`(`productid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`sellerid`) REFERENCES `users`(`userid`) ON DELETE RESTRICT ON UPDATE NO ACTION;
