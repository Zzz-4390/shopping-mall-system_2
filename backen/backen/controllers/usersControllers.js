//导入prisma客户端
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient(); // 必须实例化！

const{v4:uuidv4}=require('uuid');

//新增（注册）用户
// 注意：购物车由数据库触发器 trg_users_after_insert 自动创建，无需手动创建
exports.registUser=async(req,res)=>{
    try{
        const {phone,password}=req.body;

        // 信息校验，这个是写在前端还是后端呢，
        // 前端校验可以提供更好的用户体验，但也需要后端校验来确保数据的完整性和安全性。
        if(!phone ||!password){
            return res.status(400).json({
                code:400,
                message:'缺少必填字段'
            })
        };
        // 这里实际上返回的是一个对象，而不是一个boolean
        const isExist =await prisma.users.findUnique({where:{phone}});
        if(isExist){
            return res.status(400).json({
                code:400,
                message:'账号已存在'
            })
        };
        
        // 只需创建用户，购物车由数据库触发器自动创建
        const newuserid=uuidv4();
        const newUser = await prisma.users.create({
            data:{
                userid:newuserid,
                phone,
                password,
                name:phone.slice(-4),
                registertime:new Date()
            }
        });
        
        res.status(200).json({
            code:200,
            message:'新增用户成功（购物车由触发器自动创建）',
            data:newUser
        });
    }catch(err){
        console.error('新增用户失败:',err);
        res.status(500).json({
            code:500,
            message:'新增用户失败',
            error:err.message
        })
    }
}

//查询用户
exports.getuser=async(req,res)=>{
    try{
        const {userid}=req.params;
        if(!userid){
            return res.status(400).json({
                code:400,
                message:'缺少必填字段'
            })
        }

        const user=await prisma.users.findMany({
            where:{
                userid
            }
        });
        if(user.length===0){
            return res.status(400).json({
                code:400,
                message:'用户不存在'
            })
        }
        res.status(200).json({
            code:200,
            message:'查询用户成功',
            data:user
        });

    }catch(err){
        console.error('查询用户失败:',err);
        res.status(500).json({
            code:500,
            message:'查询用户失败',
            error:err.message
        })
    }
}

//更新用户信息  photo name password
exports.updateUser=async(req,res)=>{
    try{
        // 通过params获取userid，通过body获取要更新的信息
        const {userid}=req.params;
        const {photo, name, password, oldPassword}=req.body;
        
        const user = await prisma.users.findUnique({where:{userid}});
        if(!user){
            return res.status(400).json({
                code:400,
                message:'用户不存在'
            })
        };
        
        // 如果要更新密码，需要验证旧密码
        if(password && oldPassword) {
            if(user.password !== oldPassword) {
                return res.status(400).json({
                    code:400,
                    message:'当前密码错误'
                })
            }
        }
        
        // 构建更新数据，只包含提供的字段
        const updateData = {};
        if(photo !== undefined) updateData.photo = photo;
        if(name !== undefined) updateData.name = name;
        if(password !== undefined) updateData.password = password;
        
        const updateUser =await prisma.users.update({
            where:{
                userid
            },
            data: updateData
        });
        res.status(200).json({
            code:200,
            message:'更新用户成功',
            data:updateUser
        });

    }catch(err){
        console.error('更新用户失败:',err);
        res.status(500).json({
            code:500,
            message:'更新用户失败',
            error:err.message
        })
    }
}

//登录接口
exports.loginUser=async(req,res)=>{
    try{
        // 就使用post请求吧，用body传递账号密码
       const {phone,password} =req.body;
       if(!phone ||!password){
        return res.status(400).json({
            code:400,
            message:'缺少必填字段'
        })
       };
       const user =await prisma.users.findUnique({
         where:{phone},
         include:{
           cart: true  // 包含购物车信息
         }
       });
       // 先判断账号是否存在
       if(!user){
        return res.status(400).json({
            code:400,
            message:'账号不存在'
        })
       }
       // 再判断密码是否正确
       if(user.password!==password){
        return res.status(400).json({
            code:400,
            message:'密码错误'
        })
       }

         //都没问题了，返回登录成功信息
         console.log('登录成功');
     res.status(200).json({
        code:200,
        message:'登录成功',
        data:user
     });
    }catch(err){
        console.error('登录失败:',err.message);
        res.status(500).json({
            code:500,
            message:'登录失败',
            error:err.message
        });
    }
}