
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    // 可选：仅调试用，生产环境移除
    log: ['query', 'error', 'warn'],
})

module.exports = prisma