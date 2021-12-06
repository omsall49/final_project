const express = require('express')
const app = express()
const port = 3000
const { body, validationResult } = require('express-validator');
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { encryptPassword, setAuth } = require("./utils");
const { User, Player } = require('./models');
dotenv.config()

//몽고 DB 연결
const mongoURL = process.env.MONGODB_URL
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected!!!')
}).catch(err => {
    console.log(err)
})

//json처리
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//뷰 엔진 (api 로그인,회원가입 기능 테스트 완료후 뷰 연결)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use("/static", express.static(path.join(__dirname, 'public')));


//회원가입
app.post('/register',
    body('email').isEmail().isLength({ max: 100 }),
    body('password').isLength({ min: 8, max: 16 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const encryptedPassword = encryptPassword(password);
        let user = null;
        try {
            user = new User({ email: email, password: encryptedPassword });
            await user.save();
        } catch (err) {
            return res.send({ error: 'email is duplicated' }).status(400);
        }
        res.status(200).json({ _id: user._id });
    })

    
//로그인
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const encryptedPassword = encryptPassword(password);
    const user = await User.findOne({ email, password: encryptedPassword });

    if (user === null)
        return res.status(403).json({ error: 'email or password is invaild' });

    user.key = encryptPassword(crypto.randomBytes(20));
    await user.save();

    res.status(200).json({ key: user.key });
})


//캐릭터 생성
app.post('/player/create', setAuth, async (req, res) => {
    try {
        const { name } = req.body
        if (await Player.exists({ name })) {
            res.status(400).json({ error: "Player is already exists" })
        } else {
            const player = new Player({
                name,
                maxHP: 10,
                HP: 10,
                str: 5,
                def: 5,
                x: 0,
                y: 0
            })
            await player.save()
            res.status(200).json({ msg: "success" }) //임시 결과값
        }
    } catch (error) {
        res.status(400).json({ error: "DB_ERROR" })
    }
})


//플레이어 정보 확인
app.get('/player/:name', async (req, res) => {
    try {
        var name = req.params.name
        var player = await Player.findOne({ name })
        var level = player.level
        var maxHP = player.maxHP
        var HP = player.HP
        var str = player.str
        var def = player.def
        var x = player.x
        var y = player.y
        res.status(200).json({ level, maxHP, HP, str, def, x, y })
    } catch (error) {
        res.status(400).json({ error: "DB_ERROR" })
    }
})


//서버 포트 연결
app.listen(port, () => {
    console.log(`listening at port: ${port}...`);
})