const oauth = require('../services/oauth');
const State = require('./state');
const DB = require('../db/db');
const moment = require('./moment');
const quiz = require('./quiz');

module.exports = class User {
    constructor(nugu) {
        this.state = new State();
        this.db = new DB();
        this.nugu = nugu;
        this.todayState = this.state.QUIZ_INIT;
        this.bonusState = this.state.QUIZ_INIT;
        this.adState = this.state.QUIZ_INIT;
        this.nowState = this.state.TODAY;
        this.googleUser = null;
        this.bonusNumber = 1;
    }

    initUser() {
        return new Promise(async (resolve, reject) => {
            this.googleUser = await oauth.getGoogleUser(this.nugu.accessToken);
            const user = await this.db.query(`SELECT user_id,today_state,bonus_state,ad_state,bonus_no,DATE_FORMAT(play_dt,'%Y%m%d') AS 'formated_date' FROM users WHERE user_id = ${this.googleUser.id} for update; update users SET count=count+1 where user_id=${this.googleUser.id}`);

            if (!user[0][0]) {
                console.log('오쓰 연동 후 첫 유저 DB 등록');
                const data = [this.googleUser.id, this.googleUser.name, this.googleUser.email, this.googleUser.locale]
                this.db.query(`insert into users (user_id,name,email,locale) values (?,?,?,?)`, data);
            } else {
                const today = Number(moment().format('YYYYMMDD'))
                const playDate = Number(user[0][0].formated_date)

                // 당일 첫 플레이인 경우 상태 초기화
                if (today > playDate) {
                    await this.db.query(`UPDATE users SET today_state=0,bonus_state=0,ad_state=0,today_answer=0,bonus_answer=0,ad_answer=0 WHERE user_id=?`, this.googleUser.id);
                } else {
                    this.todayState = user[0][0].today_state;
                    this.bonusState = user[0][0].bonus_state;
                    this.adState = user[0][0].ad_state;
                    this.bonusNumber = user[0][0].bonus_no;
                }
            }
            return resolve();
        })
    }

    checkState() {
        this.setNowState();
        this.nugu.addDirective(); 
        let prompt;

        // 오늘의 퀴즈 시작할 차례
        if (this.nowState == this.state.TODAY) {
            prompt += `안녕하세요! ${this.googleUser.name} 님?`;
            nugu.directiveUrl = `${process.env.todaySound}${moment().format('YYYY')}/${quiz.quiz.today.SOUND}.mp3`;
            this.db.query(`UPDATE users SET today_state=1, answer_state=1 WHERE user_id=?`,this.googleUser.id);
        }
        // 보너스 퀴즈 시작할 차례
        if (this.nowState == this.state.BONUS) {
            QUIZ = await getBonusQuiz(user['bonus_no'])
            nugu.directiveUrl = `${process.env.todaySound}${moment().format('YYYY')}/${tquiz.quiz.bonus().SOUND}.mp3`;
            directives.audioItem.stream['url'] = process.env.bonusSound + 'bonusSound/' + QUIZ['SOUND'] + '.mp3'
            db.update('bonus_state=1, answer_state=1, bonus_no=' + (user['bonus_no'] + 1), res['Oauth'].id)
        }
        // 광고 퀴즈 시작할 차례
        if (this.nowState == this.state.AD) {
            // state : ad
            if (global.adQuiz) {
                if (global.adQuiz['DATE'] == moment().format('YYYY-MM-DD')) {
                    QUIZ = global.adQuiz
                    directives.audioItem.stream['url'] = process.env.adSound + today.toString().substring(0, 6) + '_adSound/' + QUIZ['SOUND'] + '.mp3'
                    logger.log('ad 시작')
                    db.update('ad_state=1,answer_state=1', res['Oauth'].id)
                }
            }
        }
        // 모든 퀴즈 완료한 상태 
        else {
            QUIZ = global.todayQuiz
            open_ment = {
                'nugu_common_openment': '오늘의 퀴즈를 이미 완료하셨어요! 오늘의 퀴즈는' + QUIZ['QUESTION'] + '였고,' +
                    '정답은 ' + QUIZ['CHOICE' + QUIZ['CORRECT']] + ' 이였어요!' + QUIZ['COMMENTARY'] + '. 내일까지 퀴즈를 다시 준비해 놓을게요! 오늘의 퀴즈를 종료합니다.'
            }
            responseObj['output'] = open_ment
            logger.log('response-openQuiz' + responseObj['output'])
            return res.json(responseObj)
        }
    }

    setNowState() {
        if (this.todayState == this.state.QUIZ_INIT && this.bonusState == this.state.QUIZ_INIT && this.adState == this.state.QUIZ_INIT) {
            this.nowState = this.state.TODAY;
        }
        if (this.todayState == this.state.QUIZ_FINISH && this.bonusState == this.state.QUIZ_INIT && this.adState == this.state.QUIZ_INIT) {
            this.nowState = this.state.BONUS;
        }
        if ((this.todayState == this.state.QUIZ_START && this.bonusState == this.state.QUIZ_INIT && this.adState == this.state.QUIZ_INIT) ||
            (this.todayState == this.state.QUIZ_FINISH && this.bonusState == this.state.QUIZ_START && this.adState == this.state.QUIZ_INIT) ||
            (this.todayState == this.state.QUIZ_FINISH && this.bonusState == this.state.QUIZ_FINISH && this.adState == this.state.QUIZ_INIT)
        ) {
            this.nowState = this.state.AD;
        }
    }
}