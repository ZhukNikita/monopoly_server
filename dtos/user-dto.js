module.exports = class UserDto {
    email;
    name;
    id;
    isActivated ;
    avatar;
    achievements;

    constructor(model) {
        this.email = model.email;
        this.avatar = model.avatar;
        this.name = model.name;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.achievements = model.achievements;
    }
}