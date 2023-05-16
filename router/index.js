const Router = require('express').Router;
const userController = require('../controllers/user-controller')
const router = new Router();
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')
const uploadMiddleware = require('../middlewares/upload-middleware')


router.post('/registration' ,
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    body('name').isLength({min: 3, max: 20}),
    userController.registration);
router.post('/login' , userController.login);
router.post('/uploadUserImg' , userController.login);
router.post('/logout' , userController.logout);
router.get('/activate/:link' , userController.activate);
router.get('/refresh' , userController.refresh);
router.get('/users' , authMiddleware, userController.getUsers);
router.patch('/uploadAvatar/:id' ,
    uploadMiddleware.single('image'),
    authMiddleware,
    userController.uploadUserImg)

module.exports = router