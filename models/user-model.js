const {Schema , model} = require('mongoose')


const UserSchema = new Schema({
    name:{type:String, unique : false , required : true},
    avatar:{type:String, unique : false , required : false , default: ''},
    achievements: {
        wins:{type: Number , unique: false , required: true , default: 0},
        allMoney:{type: Number , unique: false , required: true , default: 0},
        games:{type: Number , unique: false , required: true , default: 0},
    },
    email: {type:String , unique : true , required : true},
    password: {type:String , unique : false , required : true},
    isActivated: {type:Boolean , default : false },
    activationLink: {type:String}
})
module.exports = model('User' , UserSchema);