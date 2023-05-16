const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../service/mail-service')
const tokenService = require('./token-service')
const UserDto = require("../dtos/user-dto");
const ApiError = require('../exceptions/api-error')
const fs = require('fs')

class UserService{
    async registration(email, password, name){

        const candidate = await UserModel.findOne({email})
        if(candidate){
            throw  ApiError.BadRequest(`Пользователь с таким ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password , 3)
        const activationLink = uuid.v4()
        const user = await UserModel.create({email, password: hashPassword, name, activationLink})
        await mailService.sendActivationMail(email,`${process.env.API_URL}/api/activate/${activationLink}`)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id , tokens.refreshToken)
        return{
            ...tokens,
            user: userDto
        }
    }
    async activate(activationLink){
        const user = await UserModel.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequest('Неккоректная ссылка активация')
        }
        user.isActivated = true
        await user.save()
    }
    async login(email , password){
        const user = await UserModel.findOne({email})
        if(!user ){
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if(!isPassEquals){
            throw ApiError.BadRequest('Не верный пароль')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id , tokens.refreshToken)
        return{
            ...tokens,
            user: userDto
        }
    }
    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDB){
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id , tokens.refreshToken)
        return{
            ...tokens,
            user: userDto
        }
    }
    async getAllUsers(){
        const users = await UserModel.find();
        return users
    }
    async uploadUserImg(img , _id){
        const user = await UserModel.findById(_id)
        if (user.avatar){
            fs.unlink(user.avatar, err => {
                if(err) throw err;
            });
        }
        await UserModel.findByIdAndUpdate(_id,{avatar: img.path});
        return img.path
    }
}
module.exports = new UserService()