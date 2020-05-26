const Nugu = require('nugu-kit');
const User = require('./user');

async function openQuiz(nugu) {
    try {
        if(nugu.accessToken){
            const users = new User(nugu, quizs);
            await users.initUser();
            
        }else{

        }

        console.log(quizs);
    } catch (e) {
        throw e;
    }
}

function answerQuiz(nugu) {

}

function quizSound(nugu) {

}

function bonuseventSound(nugu) {

}

function adeventSound(nugu) {

}

function finishSound(nugu) {

}

function defaultFinished(nugu) {

}

function askPoint(nugu) {

}

module.exports = (req, res) => {
    const nugu = new Nugu(req);

    try {
        switch (nugu.actionName) {
            case 'common_start':
                openQuiz(nugu);
                break;
            case 'openQuiz':
                openQuiz(nugu);
                break;
            case 'answerQuiz':
                answerQuiz(nugu);
                break;
            case 'quiz_sound':
                quizSound(req);
                break;
            case 'bonusevent_sound':
                bonuseventSound(req);
                break;
            case 'adevent_sound':
                adeventSound(req);
                break;
            case 'finish_sound':
                finishSound(req);
                break;
            case 'default_finished':
                defaultFinished(req);
                break;
            case 'askPoint':
                askPoint(req);
                break;
        }
    }
    catch (e) {
        console.log(`\n${e.stack}`);
        nugu.resultCode = e.resultCode;
    } finally {
        console.log(nugu.response);
        return res.json(nugu.response);
    }
}